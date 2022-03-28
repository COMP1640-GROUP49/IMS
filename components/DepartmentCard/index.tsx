/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Button } from 'components/Button';
import { EditDepartment } from 'components/Form/form';
import { Icon } from 'components/Icon';
import Modal from 'components/Modal';
import { deleteDepartment } from 'pages/api/department';
import { IDepartmentData } from 'lib/interfaces';

const DepartmentCard = ({ department }: IDepartmentData) => {
	const { department_name, department_id } = department;
	console.log(department.accounts);
	const { asPath } = useRouter();
	const router = useRouter();

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const handleShowDeleteModal = useCallback(() => {
		setShowConfindModal(false);
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

	const [showConfindModal, setShowConfindModal] = useState(false);
	const handleConfindModal = useCallback(() => {
		setShowConfindModal(!showConfindModal);
	}, [showConfindModal]);
	const handleCloseConfindModal = useCallback(() => {
		setShowConfindModal(false);
		setShowDeleteModal(false);
	}, []);

	const handleDeleteDepartment = async () => {
		if ((department.topics as unknown as []).length === 0) {
			if (department.accounts?.length !== 0) {
				handleConfindModal();
			} else {
				await deleteDepartment(department_id, department_name);
				router.reload();
			}
		} else handleConfindModal();
	};
	return (
		<div>
			<a>
				<tr className="department-card ">
					<Link href={`${asPath}/${department_name}`} passHref>
						<td className="relative w-full">
							<div className="flex flex-col">
								<h3 className="text-subtitle font-semibold">{department_name}</h3>
								<div className="flex gap-x-2">
									<Icon name="Folder" />
									<p>
										{(department.topics as unknown as []).length > 1
											? `${(department.topics as unknown as []).length} topics available`
											: `${(department.topics as unknown as []).length} topic available`}
									</p>
								</div>
							</div>
						</td>
					</Link>
					<td className="relative hover:z-50">
						<div className="flex justify-center items-center gap-x-2 z-[1000] ">
							<Button onClick={handleShowEditDepartmentModal} icon className="btn-secondary ">
								<Icon name="Edit" size="16" />
								<p className="sm:hidden">Edit</p>
							</Button>
							{showEditDepartmentModal && (
								<Modal onCancel={handleCloseEditDepartmentModal}>
									<EditDepartment departments={department} />
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
											Are you sure you want to delete this account <span className="font-semi-bold"></span>?
										</p>
										<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
											{/*TODO: Edit delete button box-shadow*/}
											<Button onClick={handleDeleteDepartment} className="btn-danger w-full">
												Delete it
											</Button>
											{showConfindModal && (
												<Modal onCancel={handleCloseConfindModal}>
													<div className="flex flex-col gap-6 justify-center">
														<p>
															Are you sure you want to delete this account <span className="font-semi-bold"></span>?
														</p>
														<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
															{/*TODO: Edit delete button box-shadow*/}
															<Button onClick={handleCloseDeleteModal} className="btn-success  w-full">
																Ok, got it!
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
			</a>
		</div>
	);
};
export default DepartmentCard;
