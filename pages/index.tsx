/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Button } from 'components/Button';
import { DepartmentList } from 'components/DepartmentList';
import { CreateDepartmentModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import Pagination from 'components/Pagination';
import { UserContext } from 'components/PrivateRoute';
import { TopicList } from 'components/TopicList/';
import { getDepartmentNameById, getDepartmentTopics } from 'pages/api/department';
import { IDepartmentData, IDepartmentsProps, ITopicsProps } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';
import { getTopicsListByDepartmentId } from './api/topic';

export const getServerSideProps: GetServerSideProps = async () => {
	const { data, error } = await getDepartmentTopics();

	if (error) {
		throw error;
	}
	return {
		props: {
			data,
		},
	};
};

const Home: NextPage<IDepartmentsProps> = ({ data: departments }) => {
	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IDepartmentData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);
	const [department_name, setDepartmentName] = useState('');

	const user = useContext(UserContext);
	const [topics, setTopics] = useState<ITopicsProps>();

	useEffect(() => {
		const loadTopics = async () => {
			const { data } = await getTopicsListByDepartmentId(user?.user_metadata?.department as string);
			setTopics(data as unknown as ITopicsProps);
			const { department_name: name } = await getDepartmentNameById(user?.user_metadata?.department as string);
			setDepartmentName(name as string);
		};

		user && void loadTopics();

		const endOffset = itemOffset + limit;
		setCurrentItems(departments.slice(itemOffset, endOffset));
		setPageCount(Math.ceil(departments.length / limit));
	}, [itemOffset, departments, limit, user]);
	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % departments.length;
		setItemOffset(newOffset);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};

	const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
	const handleShowCreateDepartmentModal = useCallback(() => {
		setShowCreateDepartmentModal(!showCreateDepartmentModal);
	}, [showCreateDepartmentModal]);
	const handleCloseEditDepartmentModal = useCallback(() => {
		setShowCreateDepartmentModal(false);
	}, []);

	const router = useRouter();

	return (
		<>
			<MetaTags title="IMS" />
			<Header />
			{+user?.user_metadata?.role === 1 ? (
				<>
					<MetaTags title="Departments Management" description="Manage departments of IMS" />
					<Header />
					<main className="body-container flex flex-col gap-6 below-navigation-bar">
						<div className="flex flex-col gap-6 lg:flex-row  lg:justify-between">
							<h1 className="scrollPos">Departments</h1>
							<Button onClick={handleShowCreateDepartmentModal} icon className="btn-primary self-start sm:self-stretch">
								<Icon name="PlusSquare" size="16" />
								Create new departments
							</Button>
							{showCreateDepartmentModal && (
								<Modal onCancel={handleCloseEditDepartmentModal} headerText={`Create New Department`}>
									<CreateDepartmentModal />
								</Modal>
							)}
						</div>
						<DepartmentList departments={currentItems} />
						<Pagination
							items={departments as []}
							currentItems={currentItems as []}
							itemOffset={itemOffset}
							pageCount={pageCount}
							handlePaginationClick={handlePaginationClick}
							handlePageClick={handlePageClick}
						/>
					</main>
				</>
			) : +user?.user_metadata?.role === 2 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2">
							{department_name !== '' ? <h1>{`${department_name}`}</h1> : <ClipLoader />}
						</div>
					</div>
					<TopicList topics={topics} />
				</main>
			) : +user?.user_metadata?.role === 3 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2">
							{department_name !== '' ? <h1>{`${department_name}`}</h1> : <ClipLoader />}
						</div>
					</div>
					<TopicList topics={topics} />
				</main>
			) : (
				<ClipLoader />
			)}
		</>
	);
};

export default Home;
