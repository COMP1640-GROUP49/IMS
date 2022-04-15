/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { IdeaList } from 'components/IdeaList';
import { MetaTags } from 'components/MetaTags';
import Pagination from 'components/Pagination';
import { UserContext } from 'components/PrivateRoute';
import { TopicList } from 'components/TopicList';
import { getAccountData } from 'pages/api/admin';
import { getDepartmentIdByName, getTopicNameById } from 'pages/api/department';
import { getAllIdeasByTopicId, getTopicById, getTopicByName, getTopicsListByDepartmentId } from 'pages/api/topic';
import { IIdeaData, IIdeasProps, ITopicData, ITopicsProps } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const slug = params!['slug'];
	const { topicData } = await getTopicByName(slug as string);
	const { topic_name } = await getTopicNameById(
		(topicData as unknown as IIdeaData['idea']).topic_id as unknown as string
	);
	let data;
	if (topicData) {
		const { ideaList } = await getAllIdeasByTopicId(
			(topicData as unknown as ITopicData['topic']).topic_id as unknown as string
		);
		data = ideaList;
	} else {
		const { department_id } = await getDepartmentIdByName(slug as string);
		const { data: topicList } = await getTopicsListByDepartmentId(
			department_id as unknown as ITopicData['topic'] as unknown as string
		);
		data = topicList;
	}
	return {
		props: {
			slug,
			data,
			topic_name,
		},
	};
};

const Slug: NextPage = (props) => {
	const { slug }: any = props;
	const { data }: any = props;
	const ideas = data as IIdeaData['idea'];
	const topics = data as ITopicData['topic'];
	const { topic_name }: any = props;
	const { asPath } = useRouter();
	const user = useContext(UserContext);
	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IIdeaData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	useEffect(() => {
		const loadTopics = async () => {
			const { topic_name: name } = await getTopicNameById(
				(topics as unknown as IIdeaData['idea']).idea_id as unknown as string
			);
			console.log('🚀 ~ file: index.tsx ~ line 57 ~ loadTopics ~ topic_name', name);
		};
		void loadTopics();
		const endOffset = itemOffset + limit;
		setCurrentItems(((ideas as unknown as []) || (topics as unknown as [])).slice(itemOffset, endOffset));
		setPageCount(Math.ceil(((ideas as unknown as []) || (topics as unknown as [])).length / limit));
	}, [itemOffset, ideas, limit, topics]);
	const handlePageClick = (event: any) => {
		let newOffset;
		ideas
			? (newOffset = (event.selected * limit) % (ideas as unknown as []).length)
			: topics
			? (newOffset = (event.selected * limit) % (ideas as unknown as []).length)
			: null;

		setItemOffset(newOffset as number);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};

	return (
		<>
			<MetaTags title="IMS" />
			<Header />
			{(+user?.user_metadata?.role === 2 || +user?.user_metadata?.role) === 3 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2">
							<Link href={asPath.replace((slug as string).toLowerCase(), '')}>
								<a className="back-link">
									<Icon size="24" name="RotateCcw" />
									Back to categories list
								</a>
							</Link>
							{topic_name !== '' ? <h1>{`${topic_name as string}`}</h1> : <ClipLoader />}
						</div>
					</div>
					<IdeaList ideas={currentItems} />
					<Pagination
						items={ideas as unknown as []}
						currentItems={currentItems as []}
						itemOffset={itemOffset}
						pageCount={pageCount}
						handlePaginationClick={handlePaginationClick}
						handlePageClick={handlePageClick}
					/>
				</main>
			) : +user?.user_metadata?.role === 1 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2"></div>
					</div>
					<TopicList topics={currentItems} />
					<Pagination
						items={ideas as unknown as []}
						currentItems={currentItems as []}
						itemOffset={itemOffset}
						pageCount={pageCount}
						handlePaginationClick={handlePaginationClick}
						handlePageClick={handlePageClick}
					/>
				</main>
			) : (
				<ClipLoader />
			)}
		</>
	);
};
export default Slug;
