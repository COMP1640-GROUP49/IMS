/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Button } from 'components/Button';
import { DepartmentList } from 'components/DepartmentList';
import { CreateDepartmentModal } from 'components/Form/form';
import { GroupBar, HorizontalBar, LineChart, PieChart, VerticalBar } from 'components/Graph';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import Pagination from 'components/Pagination';
import { UserContext } from 'components/PrivateRoute';
import { TopicList } from 'components/TopicList/';
import { getDepartmentNameById, getDepartmentTopics } from 'pages/api/department';
import { IDepartmentData, IDepartmentsProps, ITopicData, ITopicsProps } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';
import {
	getAllIdeasInEachDepartment,
	getAnonymousCommentsInEachDepartment,
	getAnonymousIdeasInEachDepartment,
	getContributorsInEachDepartment,
	getIdeasWithoutCommentsInEachDepartment,
} from './api/graph';
import { getTopicsListByDepartmentId } from './api/topic';

export const getServerSideProps: GetServerSideProps = async (props) => {
	const { data: ideasInEachDepartment, error } = await getAllIdeasInEachDepartment();
	const { data: contributorsInEachDepartment, error: error1 } = await getContributorsInEachDepartment();
	const { data: ideasWithoutComment, error: error2 } = await getIdeasWithoutCommentsInEachDepartment();
	const { data: anonymousIdeas, error: error4 } = await getAnonymousIdeasInEachDepartment();
	const { data: anonymousComments, error: error5 } = await getAnonymousCommentsInEachDepartment();

	if (error) {
		throw error;
	}
	return {
		props: {
			ideasInEachDepartment,
			contributorsInEachDepartment,
			ideasWithoutComment,
			anonymousIdeas,
			anonymousComments,
		},
	};
};

interface DataProps {
	ideasInEachDepartment: [
		{
			department_name: string;
			ideas_count: number;
		}
	];

	contributorsInEachDepartment: [
		{
			department_name: string;
			contributors_count: number;
		}
	];

	ideasWithoutComment: [
		{
			department_name: string;
			ideas_without_comments_count: number;
		}
	];

	anonymousIdeas: [
		{
			department_name: string;
			anonymous_ideas_count: number;
		}
	];

	anonymousComments: [
		{
			department_name: string;
			anonymous_comments_count: number;
		}
	];
}

const Home: NextPage<DataProps> = (props: DataProps) => {
	const [topics, setTopics] = useState<ITopicsProps>();

	const limit = 5;
	const [currentItems, setCurrentItems] = useState<ITopicData[]>([]);
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);
	const [department_name, setDepartmentName] = useState('');

	const user = useContext(UserContext);

	useEffect(() => {
		const loadTopics = async () => {
			const { data } = await getTopicsListByDepartmentId(user?.user_metadata?.department as string);
			!topics && setTopics(data as unknown as ITopicsProps);
			const { department_name: name } = await getDepartmentNameById(user?.user_metadata?.department as string);
			setDepartmentName(name);
		};

		user && user.user_metadata.role !== 0 && user.user_metadata.role !== 1 && void loadTopics();

		const endOffset = itemOffset + limit;
		topics && setCurrentItems((topics as unknown as []).slice(itemOffset, endOffset));
		topics && setPageCount(Math.ceil((topics as unknown as []).length / limit));
	}, [itemOffset, topics, limit, user]);

	const handlePageClick = (event: any) => {
		if (topics) {
			const newOffset = (event.selected * limit) % (topics as unknown as []).length;
			setItemOffset(newOffset);
		}
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};

	const router = useRouter();

	const { ideasInEachDepartment } = props;
	const { contributorsInEachDepartment } = props;
	const { ideasWithoutComment } = props;
	const { anonymousIdeas } = props;
	const { anonymousComments } = props;

	const labels = ideasInEachDepartment.map((department) =>
		department.department_name.includes('Departments')
			? `${department.department_name.replace(` Departments`, ``)}`
			: department.department_name.includes('departments')
			? `${department.department_name.replace(` departments`, ``)}`
			: department.department_name.includes('Department')
			? `${department.department_name.replace(` Department`, ``)}`
			: department.department_name.includes('department')
			? `${department.department_name.replace(` department`, ``)}`
			: `${department.department_name.trim()}`
	);

	return (
		<>
			<MetaTags title="Home | IMS" />
			<Header />
			{/* QA Manager */}
			{+user?.user_metadata?.role === 1 ? (
				<>
					<MetaTags title="Dashboard | IMS" description="Dashboard of IMS" />
					<Header />
					<main className="below-navigation-bar flex flex-col gap-6">
						<div className="flex sm:flex-col gap-4 flex-row justify-between items-center">
							<h1 className="self-start">Dashboard</h1>
							<Link href={'/departments'} passHref>
								<Button className="btn-primary self-start sm:self-stretch">Explore departments</Button>
							</Link>
						</div>
						<div className="flex flex-col gap-6">
							<h2 className="text-sonic-silver hover:text-black">Statistic</h2>
							<div className="charts-wrapper">
								<div className="charts-group">
									<div className="graph bar-chart">
										<p>Number of ideas in each department</p>
										{ideasInEachDepartment ? (
											<VerticalBar labels={labels} data={ideasInEachDepartment} />
										) : (
											<ClipLoader />
										)}
									</div>
									<div className="lg:hidden graph pie-chart">
										<p>Percentage of ideas by each department</p>
										{ideasInEachDepartment ? <PieChart labels={labels} data={ideasInEachDepartment} /> : <ClipLoader />}
									</div>
									<div className="graph line-chart">
										<p>Number of contributors in each department</p>
										{contributorsInEachDepartment ? (
											<LineChart labels={labels} data={contributorsInEachDepartment} />
										) : (
											<ClipLoader />
										)}
									</div>
								</div>
								<div className="hidden-pie-chart">
									<p>Percentage of ideas by each department</p>
									{ideasInEachDepartment ? <PieChart labels={labels} data={ideasInEachDepartment} /> : <ClipLoader />}
								</div>
							</div>
						</div>
						<div className="flex flex-col gap-6">
							<h2 className="text-sonic-silver hover:text-black">Exception</h2>
							<div className="charts-group-2">
								<div className="graph bar-chart lg:w-1/2">
									<p>Ideas without comments</p>
									{ideasInEachDepartment ? (
										<HorizontalBar labels={labels} data={ideasWithoutComment} />
									) : (
										<ClipLoader />
									)}
								</div>
								<div className="graph line-chart lg:w-1/2">
									<p>Anonymous ideas and comments</p>
									{contributorsInEachDepartment ? (
										<GroupBar labels={labels} data1={anonymousIdeas} data2={anonymousComments} />
									) : (
										<ClipLoader />
									)}
								</div>
							</div>
						</div>
					</main>
				</>
			) : // QA Coordinator
			+user?.user_metadata?.role === 2 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2">
							{department_name !== '' ? <h1>{`${department_name}`}</h1> : <ClipLoader />}
						</div>
					</div>
					<TopicList topics={topics} />
					{topics && currentItems ? (
						<Pagination
							items={topics as unknown as []}
							currentItems={currentItems as []}
							itemOffset={itemOffset}
							pageCount={pageCount}
							handlePaginationClick={handlePaginationClick}
							handlePageClick={handlePageClick}
						/>
					) : (
						<ClipLoader />
					)}
				</main>
			) : // Staff
			+user?.user_metadata?.role === 3 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2">
							{department_name !== '' ? <h1>{`${department_name}`}</h1> : <ClipLoader />}
						</div>
					</div>
					<TopicList topics={topics} />
					{topics && currentItems ? (
						<Pagination
							items={topics as unknown as []}
							currentItems={currentItems as []}
							itemOffset={itemOffset}
							pageCount={pageCount}
							handlePaginationClick={handlePaginationClick}
							handlePageClick={handlePageClick}
						/>
					) : (
						<ClipLoader />
					)}
				</main>
			) : (
				<ClipLoader />
			)}
		</>
	);
};

export default Home;
