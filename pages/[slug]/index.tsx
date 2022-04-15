/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Header } from 'components/Header';
import { IdeaList } from 'components/IdeaList';
import { MetaTags } from 'components/MetaTags';
import { UserContext } from 'components/PrivateRoute';
import { TopicList } from 'components/TopicList';
import { getAccountData } from 'pages/api/admin';
import { getDepartmentIdByName } from 'pages/api/department';
import { getAllIdeasByTopicId, getTopicByName, getTopicsListByDepartmentId } from 'pages/api/topic';
import { IIdeaData, IIdeasProps, ITopicData, ITopicsProps } from 'lib/interfaces';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const slug = params!['slug'];
	const route = slug;
	const data = await getAccountData();

	return {
		props: {
			route,
		},
	};
};

const Slug: NextPage = (props) => {
	const { route }: any = props;

	const user = useContext(UserContext);

	const [topics, setTopics] = useState<ITopicsProps>();
	const [ideas, setIdeas] = useState<IIdeasProps>();

	useEffect(() => {
		const getCategoryData = async () => {
			// QA Coordinator & Staff
			if (+user?.user_metadata?.role !== 0 && +user?.user_metadata?.role !== 1) {
				const { topicData } = await getTopicByName(route as string);

				const { ideaList } = await getAllIdeasByTopicId(
					(topicData as unknown as ITopicData['topic']).topic_id as unknown as string
				);

				setIdeas(ideaList as unknown as IIdeasProps);
			} else {
				// QA Manager
				const { department_id } = await getDepartmentIdByName(route as string);

				const { data: topicList } = await getTopicsListByDepartmentId(
					department_id as unknown as ITopicData['topic'] as unknown as string
				);

				setTopics(topicList as unknown as ITopicsProps);
			}
		};

		void getCategoryData();
	}, [topics, ideas, user]);

	return (
		<>
			<MetaTags title="IMS" />
			<Header />

			{(+user?.user_metadata?.role === 2 || +user?.user_metadata?.role) === 3 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2"></div>
					</div>
					<IdeaList ideas={ideas} />
				</main>
			) : +user?.user_metadata?.role === 1 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2"></div>
					</div>
					<TopicList topics={topics} />
				</main>
			) : (
				<ClipLoader />
			)}
		</>
	);
};
export default Slug;
