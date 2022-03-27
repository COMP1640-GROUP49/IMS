/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Button } from 'components/Button';
import { EditDepartment } from 'components/Form/form';
import { Icon } from 'components/Icon';
import Modal from 'components/Modal';
import { IDepartments } from 'lib/interfaces';

const DepartmentCard = ({ department }: IDepartments) => {
	const { department_name } = department;
	const { asPath } = useRouter();
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const handleShowDeleteModal = useCallback(() => {
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
	return (
		<>
			<tr className="department-card">
				<td>
					<Link href={`${asPath}/${department_name}`} passHref>
						<div className="flex flex-col">
							<h3 className="text-subtitle font-semibold">{department_name}</h3>
							<div className="flex gap-x-2">
								<Icon name="Folder" />
								<p>99 topics available</p>
							</div>
						</div>
					</Link>
				</td>
				<td>
					<div className="flex justify-center items-center gap-x-2">
						<Button onClick={handleShowEditDepartmentModal} icon className="btn-secondary">
							<Icon name="Edit" size="16" />
						</Button>
						{showEditDepartmentModal && (
							<Modal onCancel={handleCloseEditDepartmentModal}>
								<EditDepartment />
							</Modal>
						)}
						<Button onClick={handleShowDeleteModal} icon className="btn-primary">
							<Icon name="Trash" size="16" />
						</Button>
						{showDeleteModal && (
							<Modal onCancel={handleCloseDeleteModal}>
								<div className="flex flex-col gap-6 justify-center">
									<p>
										Are you sure you want to delete this account <span className="font-semi-bold"></span>?
									</p>
									<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
										{/*TODO: Edit delete button box-shadow*/}
										<Button className="btn-danger w-full">Delete it</Button>
										<Button onClick={handleCloseDeleteModal} className="btn-secondary w-full">
											Cancel
										</Button>
									</div>
								</div>
							</Modal>
						)}
					</div>
				</td>
			</tr>
		</>
	);
};
export default DepartmentCard;
