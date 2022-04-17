/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import moment from 'moment';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Button } from 'components/Button';
import { CreateIdeaModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { IdeaList } from 'components/IdeaList';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import Pagination from 'components/Pagination';
import { UserContext } from 'components/PrivateRoute';
import { getCategoryByName } from 'pages/api/category';
import { getIdeasListByCategoryId } from 'pages/api/idea';
import { getAllIdeasByTopicId, getTopicById } from 'pages/api/topic';
import { ICategoryData, IIdeaData, IIdeasProps, ITopicData } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';

interface IParams extends ParsedUrlQuery {
	topic_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { category_name: slug } = params as IParams;
	const { categoryData } = await getCategoryByName(slug as string);

	const noLimit = 99999;
	const { data } = await getIdeasListByCategoryId(
		(categoryData as unknown as ICategoryData['category']).category_id as unknown as string
	);

	const { data: topicData } = await getTopicById(
		(categoryData as unknown as ICategoryData['category']).topic_id as unknown as string
	);

	return {
		props: {
			slug,
			categoryData,
			data,
			topicData,
		},
	};
};
const CategoryManagementPage: NextPage<IIdeasProps> = (props) => {
	const user = useContext(UserContext);

	const { asPath } = useRouter();

	const { data } = props;
	const { slug }: any = props;

	const { categoryData }: any = props;
	const category = categoryData as ICategoryData['category'];

	const [ideas, setIdeas] = useState<IIdeasProps>();

	!ideas && setIdeas(data as unknown as IIdeasProps);

	const { topicData }: any = props;
	const topic = topicData as ITopicData['topic'];
	const [isFirstClosureExpired, setIsFirstClosureExpired] = useState(false);
	const [isFinalClosureExpired, setIsFinalClosureExpired] = useState(false);

	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IIdeaData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % (ideas as unknown as []).length;
		setItemOffset(newOffset);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};

	const handleSortData = async (sortBy: string, topic_id?: string) => {
		const limit = 99999;
		switch (sortBy) {
			case 'most-popular': {
				const { data } = await getIdeasListByCategoryId(category.category_id);
				setIdeas(data as unknown as IIdeasProps);
				break;
			}
			case 'most-view': {
				const { data } = await getIdeasListByCategoryId(category.category_id, limit, 'idea_view', false);
				setIdeas(data as unknown as IIdeasProps);
				break;
			}
			case 'newest': {
				const { data } = await getIdeasListByCategoryId(category.category_id, limit, 'idea_created', false);
				setIdeas(data as unknown as IIdeasProps);
				break;
			}
			case 'oldest': {
				const { data } = await getIdeasListByCategoryId(category.category_id, limit, 'idea_created', true);
				setIdeas(data as unknown as IIdeasProps);
				break;
			}
			case 'latest-updated': {
				const { data } = await getIdeasListByCategoryId(category.category_id, limit, 'idea_updated', false);
				setIdeas(data as unknown as IIdeasProps);
				break;
			}
			default: {
				const { data } = await getIdeasListByCategoryId(category.category_id);
				setIdeas(data as unknown as IIdeasProps);
				break;
			}
		}
	};

	useEffect(() => {
		setIsFirstClosureExpired(moment(topic.topic_first_closure_date).isBefore(moment.now()));
		setIsFinalClosureExpired(moment(topic.topic_final_closure_date).isBefore(moment.now()));
		// isFirstClosureExpired && alert('Final closure date has expired!');

		const endOffset = itemOffset + limit;
		setCurrentItems((ideas as unknown as []).slice(itemOffset, endOffset));
		setPageCount(Math.ceil((ideas as unknown as []).length / limit));
	}, [itemOffset, ideas, topic, isFirstClosureExpired]);

	const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);

	const handleShowCreateCategoryModal = useCallback(() => {
		setShowCreateIdeaModal(!showCreateIdeaModal);
	}, [showCreateIdeaModal]);

	const handleCloseCreateIdeaModal = useCallback(() => {
		setShowCreateIdeaModal(false);
	}, []);

	return (
		<>
			{user ? (
				+user.user_metadata?.role === 0 || +user.user_metadata?.role === 1 ? (
					<>
						<MetaTags
							title={`All ideas | ${category.category_name}`}
							description={`All ideas in category ${category.category_name}`}
						/>
						<Header />
						<main className="body-container flex flex-col gap-6 below-navigation-bar">
							<div className="flex flex-col gap-6 lg:flex-row  lg:justify-between">
								<div className="flex flex-col gap-2">
									<Link href={asPath.replace((slug as string).toLowerCase(), '')}>
										<a className="back-link">
											<Icon size="24" name="RotateCcw" />
											Back to categories list
										</a>
									</Link>
									<h1>{`${category.category_name}`}</h1>
									{category.category_description && <p>{category.category_description}</p>}
								</div>
								<Button
									disabled={isFirstClosureExpired ? true : false}
									onClick={handleShowCreateCategoryModal}
									icon
									className={`${isFirstClosureExpired ? 'btn-disabled' : 'btn-primary'} self-start sm:self-stretch`}
								>
									<Icon name="FilePlus" size="16" />
									Submit new idea
								</Button>
								{showCreateIdeaModal && (
									<Modal onCancel={handleCloseCreateIdeaModal} headerText={`Create New Idea`}>
										<CreateIdeaModal account_id={user.id} topic_id={topic.topic_id} />
									</Modal>
								)}
							</div>
							{(isFirstClosureExpired || isFinalClosureExpired) && (
								<p className="text-ultra-red italic">
									{isFirstClosureExpired && isFinalClosureExpired
										? 'First & final closure'
										: isFirstClosureExpired
										? 'First closure'
										: isFinalClosureExpired && 'Final closure'}{' '}
									has expired!
								</p>
							)}
							<IdeaList ideas={currentItems} handleSortData={handleSortData} />
							<Pagination
								items={ideas as unknown as []}
								currentItems={currentItems as []}
								itemOffset={itemOffset}
								pageCount={pageCount}
								handlePaginationClick={handlePaginationClick}
								handlePageClick={handlePageClick}
							/>
						</main>
					</>
				) : (
					<ClipLoader />
				)
			) : (
				<ClipLoader />
			)}
		</>
	);
};
export default CategoryManagementPage;
