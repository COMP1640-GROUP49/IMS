/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import moment from 'moment';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback, useContext, useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { ClipLoader } from 'react-spinners';
import { Button } from 'components/Button';
import { CreateCategoryModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { IdeaList } from 'components/IdeaList';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import Pagination from 'components/Pagination';
import { UserContext } from 'components/PrivateRoute';
import { getIdeasListByCategoryId } from 'pages/api/idea';
import { getAllIdeasByTopicId, getAllIdeasByTopicIdNew, getTopicByName } from 'pages/api/topic';
import { ICategoriesProps, IIdeaData, IIdeasProps, ITopicData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import { scrollToElementByClassName } from 'utils/scrollAnimate';

interface IParams extends ParsedUrlQuery {
	topic_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { topic_name: slug } = params as IParams;
	const { topicData } = await getTopicByName(slug as string);

	const { ideaList: ideas } = await getAllIdeasByTopicIdNew(topicData.topic_id);

	return {
		props: {
			slug,
			topicData: topicData || [],
			ideas: ideas || [],
		},
	};
};

const AllIdeas: NextPage<ICategoriesProps> = (props) => {
	const { topicData }: any = props;
	const { ideas }: any = props;

	const [ideaList, setIdeaList] = useState<IIdeasProps>();
	!ideaList && setIdeaList(ideas as unknown as IIdeasProps);

	const topic = topicData as ITopicData['topic'];

	const { asPath } = useRouter();
	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IIdeaData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	const [isFirstClosureExpired, setIsFirstClosureExpired] = useState(false);

	const [isFinalClosureExpired, setIsFinalClosureExpired] = useState(false);
	const [ideaListCSV, setIdeaListCSV] = useState([]);

	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % (ideaList as unknown as []).length;
		setItemOffset(newOffset);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};

	const [sortOptions, setSortOptions] = useState({
		category: '',
		sort: '',
	});
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
								setIdeaList(ideaList as unknown as IIdeasProps);
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
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						case 'most-view': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category, limit, 'idea_view', false);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						case 'newest': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category, limit, 'idea_created', false);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						case 'oldest': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category, limit, 'idea_created', true);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						case 'latest-updated': {
							const { data } = await getIdeasListByCategoryId(sortOptions.category, limit, 'idea_updated', false);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						default: {
							if (topic_id) {
								const { ideaList } = await getAllIdeasByTopicIdNew(topic_id);
								setIdeaList(ideaList as unknown as IIdeasProps);
							}
							break;
						}
					}
				}
			}
		} else {
			if (topic_id) {
				const { ideaList } = await getAllIdeasByTopicIdNew(topic_id, sortBy);
				setIdeaList(ideaList as unknown as IIdeasProps);
			}
		}
	};

	const handleChangeCategorySort = async (category_id: string) => {
		const limit = 99999;
		setSortOptions({ ...sortOptions, category: category_id });

		if (sortOptions.sort !== '') {
			switch (category_id) {
				case 'all-categories': {
					const { ideaList } = await getAllIdeasByTopicIdNew(topic.topic_id, sortOptions.sort);
					setIdeaList(ideaList as unknown as IIdeasProps);
					break;
				}
				default: {
					switch (sortOptions.sort) {
						case 'most-popular': {
							const { data } = await getIdeasListByCategoryId(category_id);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						case 'most-view': {
							const { data } = await getIdeasListByCategoryId(category_id, limit, 'idea_view', false);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						case 'newest': {
							const { data } = await getIdeasListByCategoryId(category_id, limit, 'idea_created', false);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						case 'oldest': {
							const { data } = await getIdeasListByCategoryId(category_id, limit, 'idea_created', true);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
						case 'latest-updated': {
							const { data } = await getIdeasListByCategoryId(category_id, limit, 'idea_updated', false);
							setIdeaList(data as unknown as IIdeasProps);
							break;
						}
					}
					break;
				}
			}
		} else {
			switch (category_id) {
				case 'all-categories': {
					const { ideaList } = await getAllIdeasByTopicIdNew(topic.topic_id);
					setIdeaList(ideaList as unknown as IIdeasProps);
					break;
				}
				default: {
					const { data } = await getIdeasListByCategoryId(category_id);
					setIdeaList(data as unknown as IIdeasProps);
					break;
				}
			}
		}
	};

	const [showCreateCategoriesModal, setShowCreateCategoriesModal] = useState(false);
	const handleShowCreateCategoryModal = useCallback(() => {
		setShowCreateCategoriesModal(!showCreateCategoriesModal);
	}, [showCreateCategoriesModal]);

	const handleCloseCreateCategoriesModal = useCallback(() => {
		setShowCreateCategoriesModal(false);
	}, []);

	const handleDownloadAllIdeas = async () => {
		const prepareFile = async () => {
			const { ideaList } = await getAllIdeasByTopicIdNew(topic.topic_id);
			ideaList && setIdeaListCSV(ideaList as unknown as []);
		};
		await notifyToast(
			prepareFile(),
			`Preparing CSV file for you to download.`,
			`Your file has been ready to download.`
		);

		if (typeof document !== 'undefined') {
			const CSVElement = document.querySelectorAll('a');
			Array.from(CSVElement)
				.filter(({ download }) => download.includes('-csv.csv'))[0]
				.click();
		}
	};

	useEffect(() => {
		const prepareFileToDownload = async () => {
			const { ideaList } = await getAllIdeasByTopicIdNew(topic.topic_id);
			ideaList && setIdeaListCSV(ideaList as unknown as []);
		};

		void prepareFileToDownload();

		setIsFirstClosureExpired(moment(topic.topic_first_closure_date).isBefore(moment.now()));
		setIsFinalClosureExpired(moment(topic.topic_final_closure_date).isBefore(moment.now()));

		const endOffset = itemOffset + limit;
		setCurrentItems((ideaList as unknown as []).slice(itemOffset, endOffset));
		setPageCount(Math.ceil((ideaList as unknown as []).length / limit));
	}, [itemOffset, topic, ideaList]);

	const user = useContext(UserContext);

	return (
		<>
			{user ? (
				+user.user_metadata?.role === 0 ? (
					<>
						<MetaTags
							title={`All ideas | ${topic.topic_name}`}
							description={`All ideas in topic ${topic.topic_name}`}
						/>
						<Header />
						<main className="body-container flex flex-col gap-6 below-navigation-bar">
							<div className="flex flex-col gap-6 lg:flex-row  lg:justify-between">
								<div className="flex flex-col gap-2">
									<Link href={asPath.replace('all-ideas', '')}>
										<a className="back-link">
											<Icon size="24" name="RotateCcw" />
											Back to list of categories
										</a>
									</Link>
									<h1>{`${topic.topic_name}`}</h1>
									{topic.topic_description && <p>{topic.topic_description}</p>}
									<p>
										Start Date:{' '}
										<span className="font-semi-bold">{moment(topic.topic_start_date).format('MMM DD, YYYY')}</span>
									</p>
									<p>
										First Closure Date:{' '}
										<span className="font-semi-bold">
											{moment(topic.topic_first_closure_date).format('MMM DD, YYYY')}
										</span>{' '}
										{isFirstClosureExpired && <span className="text-ultra-red italic">(expired)</span>}
									</p>
									<p>
										Final Closure Date:{' '}
										<span className="font-semi-bold">
											{moment(topic.topic_final_closure_date).format('MMM DD, YYYY')}
										</span>{' '}
										{isFinalClosureExpired && <span className="text-ultra-red italic">(expired)</span>}
									</p>
								</div>
								<div className="flex flex-col md:flex-row gap-4  md:justify-between justify-center">
									<Button
										onClick={handleShowCreateCategoryModal}
										icon
										className="btn-primary lg:w-full self-start sm:self-stretch"
									>
										<Icon name="PlusCircle" size="16" />
										Create new category
									</Button>
									<Button
										onClick={handleDownloadAllIdeas}
										icon
										className="sm:w-full btn-secondary self-start sm:self-stretch"
									>
										<Icon name="Download" size="16" />
										Download all ideas as CSV
									</Button>
									<CSVLink
										className="hidden"
										data={ideaListCSV as unknown as []}
										filename={`${topic.topic_name.toLowerCase().replace(/ /g, `-`)}-csv.csv`}
									/>
								</div>
								{showCreateCategoriesModal && (
									<Modal onCancel={handleCloseCreateCategoriesModal} headerText={`Create New Category`}>
										<CreateCategoryModal topic_id={topic.topic_id} />
									</Modal>
								)}
							</div>
							<IdeaList
								topic_id={topic.topic_id}
								ideas={currentItems}
								handleSortData={handleSortData}
								handleChangeCategorySort={handleChangeCategorySort}
							/>
							<Pagination
								items={ideaList as unknown as []}
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
export default AllIdeas;
