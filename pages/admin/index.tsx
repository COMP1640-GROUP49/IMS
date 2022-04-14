import type { GetServerSideProps, NextPage } from 'next';
import { ClipLoader } from 'react-spinners';
import { PieChart, VerticalBar } from 'components/Graph';
import { Header } from 'components/Header';
import { MetaTags } from 'components/MetaTags';
import { getAllIdeasInEachDepartment } from 'pages/api/graph';

export const getServerSideProps: GetServerSideProps = async () => {
	const { data: ideasInEachDepartment, error } = await getAllIdeasInEachDepartment();

	if (error) {
		throw error;
	}
	return {
		props: {
			ideasInEachDepartment,
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
}

const AdminHome: NextPage<DataProps> = (props) => {
	const { ideasInEachDepartment } = props;
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
			<MetaTags title="Dashboard" description="Dashboard of IMS" />
			<Header />
			<main className="below-navigation-bar flex flex-col gap-6">
				<h1>Dashboard</h1>
				<div className="flex flex-col gap-6">
					<h2 className="text-sonic-silver">Statistic</h2>
					<div className="graph">
						<p>Number of ideas in each department</p>
						{ideasInEachDepartment ? <VerticalBar labels={labels} data={ideasInEachDepartment} /> : <ClipLoader />}
					</div>
					<div className="graph">
						<p>Percentage of ideas by each department</p>
						{ideasInEachDepartment ? <PieChart labels={labels} data={ideasInEachDepartment} /> : <ClipLoader />}
					</div>
				</div>
			</main>
		</>
	);
};

export default AdminHome;
