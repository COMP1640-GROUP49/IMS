/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Header } from 'components/Header';
import { getDepartmentsList } from 'pages/api/department';
import { IDepartmentData } from 'lib/interfaces';
import supabase from 'utils/supabase';

export const getServerSideProps: GetServerSideProps = async () => {
	const { data, error } = await getDepartmentsList();
	if (error) {
		throw error;
	}
	return {
		props: {
			data,
		},
	};
};

const DepartmentPage: NextPage = ({ data, hehe }: any) => {
	console.log('🚀 ~ file: index.tsx ~ line 23 ~ hehe', hehe);
	const { asPath } = useRouter();
	return (
		<>
			<Header />
			<div className="below-navigation-bar overflow-auto">
				List of department:
				<ul>
					{data.map((department: any) => (
						<Link
							key={department?.department_id}
							href={{
								pathname: `${asPath}/${(department?.department_name as string)
									.replace(` Department`, '')
									.toLowerCase()}`,
							}}
						>
							<a>
								<DepartmentCard department={department} />
							</a>
						</Link>
					))}
				</ul>
			</div>
		</>
	);
};

const DepartmentCard = ({ department }: any) => {
	const [topic, setTopic] = useState(0);
	// console.log('🚀 ~ file: index.tsx ~ line 45 ~ DepartmentCard ~ department', department);

	useEffect(() => {
		const getData = async () => {
			const { data } = await supabase.rpc('con_cat', { department_id_val: department?.department_id });
			if (data) {
				const topics_count = data[0]?.topics_count as number;
				setTopic(topics_count);
			}
		};

		void getData();
	}, [department?.department_id]);
	return (
		<>
			<li>
				{department?.department_id}. {department?.department_name}
			</li>
			<p>{topic ? `${topic} topics available` : '0 topics available'} topic</p>
		</>
	);
};

export default DepartmentPage;
