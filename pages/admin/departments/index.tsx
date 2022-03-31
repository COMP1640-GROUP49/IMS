/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GetServerSideProps, NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { DepartmentList } from 'components/DepartmentList';
import { CreateDepartmentModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import Pagination from 'components/Pagination';
import { getDepartmentTopics } from 'pages/api/department';
import { IDepartmentsProps, IDepartmentData } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';

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

const DepartmentManagementPage: NextPage<IDepartmentsProps> = ({ data: departments }) => {
	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IDepartmentData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	useEffect(() => {
		const endOffset = itemOffset + limit;
		setCurrentItems(departments.slice(itemOffset, endOffset));
		setPageCount(Math.ceil(departments.length / limit));
	}, [itemOffset, departments, limit]);

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

	return (
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
	);
};
export default DepartmentManagementPage;
