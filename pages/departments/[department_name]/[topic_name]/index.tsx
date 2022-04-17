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
import { CategoryList } from 'components/CategoryList';
import { CreateCategoryModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import Pagination from 'components/Pagination';
import { UserContext } from 'components/PrivateRoute';
import { getCategoriesListByTopicId } from 'pages/api/category';
import { getAllIdeasByTopicId, getAllIdeasByTopicIdNew, getTopicByName } from 'pages/api/topic';
import { getIdeasCSV, headersCSV } from 'lib/csv-headers';
import { ICategoriesProps, ICategoryData, ITopicData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import { scrollToElementByClassName } from 'utils/scrollAnimate';

interface IParams extends ParsedUrlQuery {
	topic_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { topic_name: slug } = params as IParams;
	const { topicData } = await getTopicByName(slug as string);
	const { data } = await getCategoriesListByTopicId(
		(topicData as unknown as ITopicData['topic']).topic_id as unknown as string
	);

	return {
		props: {
			slug,
			topicData,
			data,
		},
	};
};

const TopicsManagementPage: NextPage<ICategoriesProps> = (props) => {
	const { data: categories } = props;
	const { slug }: any = props;
	const { topicData }: any = props;
	const topic = topicData as ITopicData['topic'];
	const { asPath } = useRouter();
	const limit = 5;
	const [currentItems, setCurrentItems] = useState<ICategoryData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	const [isFirstClosureExpired, setIsFirstClosureExpired] = useState(false);

	const [isFinalClosureExpired, setIsFinalClosureExpired] = useState(false);
	const [ideaListCSV, setIdeaListCSV] = useState([]);

	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % categories.length;
		setItemOffset(newOffset);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
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
			const { ideaList } = await getIdeasCSV(topic.topic_id);
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
		setIsFirstClosureExpired(moment(topic.topic_first_closure_date).isBefore(moment.now()));
		setIsFinalClosureExpired(moment(topic.topic_final_closure_date).isBefore(moment.now()));

		const endOffset = itemOffset + limit;
		setCurrentItems(categories.slice(itemOffset, endOffset));
		setPageCount(Math.ceil(categories.length / limit));
	}, [itemOffset, categories, limit, topic]);

	const user = useContext(UserContext);
	return (
		<>
			{user ? (
				+user.user_metadata?.role === 0 || +user.user_metadata?.role === 1 ? (
					<>
						<MetaTags title={`${topic.topic_name}`} description={`Categories in topic ${topic.topic_name}`} />
						<Header />
						<main className="body-container flex flex-col gap-6 below-navigation-bar">
							<div className="flex flex-col gap-6 lg:flex-row  lg:justify-between">
								<div className="flex flex-col gap-2">
									<Link href={asPath.replace((slug as string).toLowerCase(), '')}>
										<a className="back-link">
											<Icon size="24" name="RotateCcw" />
											Back to topics list
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
										headers={headersCSV}
										filename={`${topic.topic_name.toLowerCase().replace(/ /g, `-`)}-csv.csv`}
									/>
								</div>
								{showCreateCategoriesModal && (
									<Modal onCancel={handleCloseCreateCategoriesModal} headerText={`Create New Category`}>
										<CreateCategoryModal topic_id={topic.topic_id} />
									</Modal>
								)}
							</div>
							<CategoryList categories={currentItems} />
							<Pagination
								items={categories as []}
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
export default TopicsManagementPage;
