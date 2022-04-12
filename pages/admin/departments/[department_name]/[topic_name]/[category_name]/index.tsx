/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import moment from 'moment';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback, useContext, useEffect, useState } from 'react';
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
import { getTopicById } from 'pages/api/topic';
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
		(categoryData as unknown as ICategoryData['category']).category_id as unknown as string,
		noLimit,
		'idea_created',
		false
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

	const { data: ideas } = props;
	const { slug }: any = props;

	const { categoryData }: any = props;
	const category = categoryData as ICategoryData['category'];

	const { topicData }: any = props;
	const topic = topicData as ITopicData['topic'];
	const [isFinalClosureExpired, setIsFinalClosureExpired] = useState(false);

	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IIdeaData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	useEffect(() => {
		// Check for expire final closure date
		setIsFinalClosureExpired(moment(topic.topic_final_closure_date).isBefore(moment.now()));
		// isFinalClosureExpired && alert('Final closure date has expired!');

		const endOffset = itemOffset + limit;
		setCurrentItems(ideas.slice(itemOffset, endOffset));
		setPageCount(Math.ceil(ideas.length / limit));
	}, [itemOffset, ideas, limit, topic, isFinalClosureExpired]);

	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % ideas.length;
		setItemOffset(newOffset);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};

	const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);
	const handleShowCreateCategoryModal = useCallback(() => {
		setShowCreateIdeaModal(!showCreateIdeaModal);
	}, [showCreateIdeaModal]);
	const handleCloseCreateIdeaModal = useCallback(() => {
		setShowCreateIdeaModal(false);
	}, []);

	return (
		<>
			<MetaTags title={`${category.category_name}`} description={`Ideas in category ${category.category_name}`} />
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
						disabled={isFinalClosureExpired ? true : false}
						onClick={handleShowCreateCategoryModal}
						icon
						className={`${isFinalClosureExpired ? 'btn-disabled' : 'btn-primary'} self-start sm:self-stretch`}
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
				{isFinalClosureExpired && <p className="text-ultra-red italic">Final closure date has expired!</p>}
				<IdeaList ideas={currentItems} />
				<Pagination
					items={ideas as []}
					currentItems={currentItems as []}
					itemOffset={itemOffset}
					pageCount={pageCount}
					handlePaginationClick={handlePaginationClick}
					handlePageClick={handlePageClick}
				/>
			</main>
		</>
	);
};
export default CategoryManagementPage;
