/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GetServerSideProps, NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { DepartmentList } from 'components/DepartmentList';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import Pagination from 'components/Pagination';
import { getDepartmentList } from 'pages/api/admin';
import { IDeparmentsProps, IDepartments } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';
import { CreateDepartment } from './[department]/create';

export const getServerSideProps: GetServerSideProps = async () => {
	const { data, error } = await getDepartmentList();
	if (error) {
		throw error;
	}
	return {
		props: {
			data,
		},
	};
};

const DeparmentManager: NextPage<IDeparmentsProps> = ({ data: department }) => {
	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IDepartments[]>();
	console.log('🚀 ~ file: index.tsx ~ line 31 ~ currentItems', currentItems);
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	useEffect(() => {
		const endOffset = itemOffset + limit;
		setCurrentItems(department.slice(itemOffset, endOffset));
		setPageCount(Math.ceil(department.length / limit));
	}, [itemOffset, department, limit]);

	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % department.length;
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
			<MetaTags title="Department Management" description="Manage department of IMS" />
			<Header />
			<main className="body-container flex flex-col gap-6 below-navigation-bar">
				<div className="flex flex-col gap-6 lg:flex-row  lg:justify-between">
					<h1 className="scrollPos">Departments</h1>
					<Button onClick={handleShowCreateDepartmentModal} icon className="btn-primary self-start sm:self-stretch">
						<Icon name="PlusSquare" size="16" />
						Create new department
					</Button>
					{showCreateDepartmentModal && (
						<Modal onCancel={handleCloseEditDepartmentModal} headerText={`Create New Department`}>
							<CreateDepartment />
						</Modal>
					)}
				</div>
				<DepartmentList department={currentItems} />
				<Pagination
					items={department as []}
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
export default DeparmentManager;
