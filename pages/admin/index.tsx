import type { GetServerSideProps, NextPage } from 'next';
import { useContext } from 'react';
import { ClipLoader } from 'react-spinners';
import { GroupBar, HorizontalBar, LineChart, PieChart, VerticalBar } from 'components/Graph';
import { Header } from 'components/Header';
import { MetaTags } from 'components/MetaTags';
import { UserContext } from 'components/PrivateRoute';
import {
	getAllIdeasInEachDepartment,
	getAnonymousCommentsInEachDepartment,
	getAnonymousIdeasInEachDepartment,
	getContributorsInEachDepartment,
	getIdeasWithoutCommentsInEachDepartment,
} from 'pages/api/graph';

export const getServerSideProps: GetServerSideProps = async () => {
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

const AdminHome: NextPage<DataProps> = (props) => {
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

	const user = useContext(UserContext);

	return (
		<>
			{user ? (
				+user.user_metadata?.role === 0 ? (
					<>
						<MetaTags title="Dashboard | IMS" description="Dashboard of IMS" />
						<Header />
						<main className="below-navigation-bar flex flex-col gap-6">
							<h1>Dashboard</h1>
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
											{ideasInEachDepartment ? (
												<PieChart labels={labels} data={ideasInEachDepartment} />
											) : (
												<ClipLoader />
											)}
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
				) : (
					<ClipLoader />
				)
			) : (
				<>
					<ClipLoader />
				</>
			)}
		</>
	);
};

export default AdminHome;
