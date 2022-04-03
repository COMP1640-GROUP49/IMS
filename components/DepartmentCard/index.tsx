/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useContext, useState } from 'react';
import { Button } from 'components/Button';
import { EditDepartmentModal } from 'components/Form/form';
import { Icon } from 'components/Icon';
import Modal from 'components/Modal';
import { UserContext } from 'components/PrivateRoute';
import { deleteDepartment } from 'pages/api/department';
import { IDepartmentData } from 'lib/interfaces';

const DepartmentCard = ({ department }: IDepartmentData) => {
	const user = useContext(UserContext);
	const { department_name, department_id } = department;
	const { asPath } = useRouter();
	const router = useRouter();

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const handleShowDeleteModal = useCallback(() => {
		setShowConfirmModal(false);
		setShowDeleteModal(!showDeleteModal);
	}, [showDeleteModal]);

	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteModal(false);
	}, []);

	const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);

	const handleShowEditDepartmentModal = useCallback(() => {
		setShowEditDepartmentModal(!showDeleteModal);
	}, [showDeleteModal]);

	const handleCloseEditDepartmentModal = useCallback(() => {
		setShowEditDepartmentModal(false);
	}, []);

	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const handleConfirmModal = useCallback(() => {
		setShowConfirmModal(!showConfirmModal);
	}, [showConfirmModal]);

	const handleCloseConfirmModal = useCallback(() => {
		setShowConfirmModal(false);
		setShowDeleteModal(false);
	}, []);

	const handleDeleteDepartment = async () => {
		if ((department.topics as unknown as []).length === 0) {
			if (department.accounts?.length !== 0) {
				handleConfirmModal();
			} else {
				await deleteDepartment(department_id, department_name);
				router.reload();
			}
		} else handleConfirmModal();
	};
	return (
		<tr className="department-card">
			<Link
				href={
					// TODO: Refactor with regex
					department_name.includes('Departments')
						? `${asPath}/${department_name.replace(` Departments`, ``).toLowerCase()}`
						: department_name.includes('departments')
						? `${asPath}/${department_name.replace(` departments`, ``).toLowerCase()}`
						: department_name.includes('Department')
						? `${asPath}/${department_name.replace(` Department`, ``).toLowerCase()}`
						: department_name.includes('department')
						? `${asPath}/${department_name.replace(` department`, ``).toLowerCase()}`
						: `${asPath}/${department_name.trim().toLowerCase()}`
				}
				passHref
			>
				<a className="w-full">
					<td>
						<div className="flex flex-col gap-2">
							<h3 className="text-subtitle font-semi-bold">{department_name}</h3>
							{user?.user_metadata?.role === 0 && (
								<div className="flex flex-row gap-1 items-center card-info">
									<Icon name="Users" size="16" />
									<p>
										{(department.accounts as unknown as []).length > 1
											? `${(department.accounts as unknown as []).length} user accounts `
											: `${(department.accounts as unknown as []).length} user account`}
									</p>
								</div>
							)}

							<div className="flex flex-row gap-1 items-center card-info">
								<Icon name="Folder" size="16" />
								<p>
									{(department.topics as unknown as []).length > 1
										? `${(department.topics as unknown as []).length} topics available`
										: `${(department.topics as unknown as []).length} topic available`}
								</p>
							</div>
						</div>
					</td>
				</a>
			</Link>
			<td>
				<div className="flex justify-center items-center gap-x-2 z-[1000] ">
					<Button onClick={handleShowEditDepartmentModal} icon className="btn-secondary ">
						<Icon name="Edit" size="16" />
						<p className="sm:hidden">Edit</p>
					</Button>
					{showEditDepartmentModal && (
						<Modal onCancel={handleCloseEditDepartmentModal} headerText={`Edit ${department.department_name}`}>
							<EditDepartmentModal department={department} />
						</Modal>
					)}
					<Button onClick={handleShowDeleteModal} icon className="btn-primary">
						<Icon name="Trash" size="16" />
						<p className="sm:hidden">Delete</p>
					</Button>
					{showDeleteModal && (
						<Modal onCancel={handleCloseDeleteModal}>
							<div className="flex flex-col gap-6 justify-center">
								<p>
									Are you sure you want to delete this{' '}
									<span className="font-semi-bold">{department.department_name}</span>?
								</p>
								<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
									{/*TODO: Edit delete button box-shadow*/}
									<Button onClick={handleDeleteDepartment} className="btn-danger w-full">
										Delete it
									</Button>
									{showConfirmModal && (
										<Modal onCancel={handleCloseConfirmModal}>
											<div className="flex flex-col gap-6 justify-center">
												<p>
													Please remove all user accounts or topics inside{' '}
													<span className="font-semi-bold">{department.department_name}</span> before deleting it!
												</p>
												<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
													{/*TODO: Edit delete button box-shadow*/}
													<Button onClick={handleCloseConfirmModal} className="btn-success w-full">
														Ok, got it!{' '}
													</Button>
												</div>
											</div>
										</Modal>
									)}

									<Button onClick={handleCloseDeleteModal} className="btn-secondary  w-full">
										Cancel
									</Button>
								</div>
							</div>
						</Modal>
					)}
				</div>
			</td>
		</tr>
	);
};
export default DepartmentCard;
