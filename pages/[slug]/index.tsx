/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
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
import { getTopicNameById } from 'pages/api/department';
import { getIdeasListByCategoryId } from 'pages/api/idea';
import { getAllIdeasByTopicId, getAllIdeasByTopicIdNew, getTopicByName } from 'pages/api/topic';
import { IIdeaData, IIdeasProps, ITopicData } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';

interface IParams extends ParsedUrlQuery {
	topic_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { slug } = params as IParams;

	const { topicData } = await getTopicByName(slug as string);

	const { topic_name } = await getTopicNameById(
		(topicData as unknown as IIdeaData['idea']).topic_id as unknown as string
	);

	let data;

	if (topicData) {
		const { ideaList } = await getAllIdeasByTopicIdNew(
			(topicData as unknown as ITopicData['topic']).topic_id as unknown as string
		);
		data = ideaList;
	}
	return {
		props: {
			slug,
			data,
			topicData,
			topic_name,
		},
	};
};

const AllIdeasPage: NextPage = (props) => {
	const { asPath } = useRouter();
	const user = useContext(UserContext);

	const { slug }: any = props;

	const { data }: any = props;

	const { topicData: topic }: any = props;

	const { topic_name }: any = props;

	const [ideas, setIdeas] = useState<IIdeasProps>();
	!ideas && setIdeas(data as unknown as IIdeasProps);

	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IIdeaData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	const [isFirstClosureExpired, setIsFirstClosureExpired] = useState(false);

	const [isFinalClosureExpired, setIsFinalClosureExpired] = useState(false);

	const [sortOptions, setSortOptions] = useState({
		category: '',
		sort: '',
	});

	useEffect(() => {
		setIsFirstClosureExpired(moment(topic.topic_first_closure_date as string).isBefore(moment.now()));
		setIsFinalClosureExpired(moment(topic.topic_final_closure_date as string).isBefore(moment.now()));

		const endOffset = itemOffset + limit;
		setCurrentItems(((ideas as unknown as []) || (ideas as unknown as [])).slice(itemOffset, endOffset));
		setPageCount(Math.ceil(((ideas as unknown as []) || (ideas as unknown as [])).length / limit));
	}, [itemOffset, ideas, limit, topic]);

	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % (ideas as unknown as []).length;
		setItemOffset(newOffset);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};

	const handleSortData = async (sortBy: string, topic_id?: string) => {
		const limit = 99999;
		setSortOptions({ ...sortOptions, sort: sortBy });

		if (sortOptions.category !== '') {
			switch (sortOptions.category) {
				case 'all-categories': {
					switch (sortBy) {
						default: {
							if (topic_id) {
								const { ideaList } = await getAllIdeasByTopicIdNew(topic_id, sortBy);
								setIdeas(ideaList as unknown as IIdeasProps);
							}
							break;
						}
					}
					break;
				}
				default: {
					switch (sortBy) {
						case 'most-popular': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						case 'most-view': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category, limit, 'idea_view', false);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						case 'newest': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category, limit, 'idea_created', false);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						case 'oldest': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category, limit, 'idea_created', true);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						case 'latest-updated': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category, limit, 'idea_updated', false);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						default: {
							if (topic_id) {
								const { ideaList } = await getAllIdeasByTopicIdNew(topic_id);
								setIdeas(ideaList as unknown as IIdeasProps);
							}
							break;
						}
					}
				}
			}
		} else {
			if (topic_id) {
				const { ideaList } = await getAllIdeasByTopicIdNew(topic_id, sortBy);
				setIdeas(ideaList as unknown as IIdeasProps);
			}
		}
	};

	const handleChangeCategorySort = async (category_id: string) => {
		const limit = 99999;
		setSortOptions({ ...sortOptions, category: category_id });

		if (sortOptions.sort !== '') {
			switch (category_id) {
				case 'all-categories': {
					const { ideaList } = await getAllIdeasByTopicIdNew((topic as ITopicData['topic']).topic_id, sortOptions.sort);
					setIdeas(ideaList as unknown as IIdeasProps);
					break;
				}
				default: {
					switch (sortOptions.sort) {
						case 'most-popular': {
							const { data } = await getIdeasListByCategoryId(category_id);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						case 'most-view': {
							const { data } = await getIdeasListByCategoryId(category_id, limit, 'idea_view', false);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						case 'newest': {
							const { data } = await getIdeasListByCategoryId(category_id, limit, 'idea_created', false);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						case 'oldest': {
							const { data } = await getIdeasListByCategoryId(category_id, limit, 'idea_created', true);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
						case 'latest-updated': {
							const { data } = await getIdeasListByCategoryId(category_id, limit, 'idea_updated', false);
							setIdeas(data as unknown as IIdeasProps);
							break;
						}
					}
					break;
				}
			}
		} else {
			switch (category_id) {
				case 'all-categories': {
					const { ideaList } = await getAllIdeasByTopicIdNew((topic as ITopicData['topic']).topic_id);
					setIdeas(ideaList as unknown as IIdeasProps);
					break;
				}
				default: {
					const { data } = await getIdeasListByCategoryId(category_id);
					setIdeas(data as unknown as IIdeasProps);
					break;
				}
			}
		}
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
			<MetaTags
				title={`All ideas | ${topic_name as string}`}
				description={`All ideas in topic ${topic_name as string}`}
			/>
			<Header />
			<main className="body-container flex flex-col gap-6 below-navigation-bar">
				<div className="flex flex-col gap-6 lg:flex-row  lg:justify-between">
					<div className="flex flex-col gap-2">
						<Link href={asPath.replace(`${slug as string}`, '')}>
							<a className="back-link">
								<Icon size="24" name="RotateCcw" />
								Back to list of topics
							</a>
						</Link>
						<h1>{`${topic_name as string}`}</h1>
						{topic.topic_description && <p>{topic.topic_description}</p>}
						<p>
							Start Date:{' '}
							<span className="font-semi-bold">{moment(topic.topic_start_date as string).format('MMM DD, YYYY')}</span>
						</p>
						<p>
							First Closure Date:{' '}
							<span className="font-semi-bold">
								{moment(topic.topic_first_closure_date as string).format('MMM DD, YYYY')}
							</span>{' '}
							{isFirstClosureExpired && <span className="text-ultra-red italic">(expired)</span>}
						</p>
						<p>
							Final Closure Date:{' '}
							<span className="font-semi-bold">
								{moment(topic.topic_final_closure_date as string).format('MMM DD, YYYY')}
							</span>{' '}
							{isFinalClosureExpired && <span className="text-ultra-red italic">(expired)</span>}
						</p>
					</div>
					<div className="flex flex-col md:flex-row gap-4  md:justify-between justify-center items-stretch">
						<Button
							disabled={isFirstClosureExpired ? true : false}
							onClick={handleShowCreateCategoryModal}
							icon
							className={`${
								isFirstClosureExpired ? 'btn-disabled' : 'btn-primary'
							} self-start sm:self-stretch lg:self-stretch`}
						>
							<Icon name="FilePlus" size="16" />
							Submit new idea
						</Button>
						{showCreateIdeaModal && (
							<Modal onCancel={handleCloseCreateIdeaModal} headerText={`Create New Idea`}>
								<CreateIdeaModal account_id={user.id} topic_id={(topic as ITopicData['topic']).topic_id} />
							</Modal>
						)}
						{user ? (
							+user.user_metadata?.role === 2 && (
								<Button
									onClick={() => alert('Feature on working!')}
									icon
									className="sm:w-full btn-secondary self-start sm:self-stretch"
								>
									<Icon name="Mail" size="16" />
									Notify everyone about this topic{' '}
								</Button>
							)
						) : (
							<ClipLoader />
						)}
					</div>
				</div>
				<IdeaList
					topic_id={topic.topic_id as string}
					ideas={currentItems}
					handleSortData={handleSortData}
					handleChangeCategorySort={handleChangeCategorySort}
					sortOptions={sortOptions}
				/>
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
	);
};
export default AllIdeasPage;
