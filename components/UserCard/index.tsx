/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { EditUserModal } from 'components/Form/form';
import { Icon } from 'components/Icon';
import Modal from 'components/Modal';
import { deleteAccount } from 'pages/api/admin';
import { IAccountData } from 'lib/interfaces';

export const UserCard = ({ account }: IAccountData) => {
	const router = useRouter();
	const {
		// account_id,
		username,
		// encrypted_password,
		account_role,
		account_department,
		// account_email,
		// account_full_name,
		// account_address,
		// account_phone_number,
		avatar_url,
		created,
	} = account;

	const [showEditModal, setShowEditModal] = useState(false);
	const handleShowEditModal = useCallback(() => {
		setShowEditModal(!showEditModal);
	}, [showEditModal]);
	const handleCloseEditModal = useCallback(() => {
		setShowEditModal(false);
	}, []);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const handleShowDeleteModal = useCallback(() => {
		setShowDeleteModal(!showDeleteModal);
	}, [showDeleteModal]);
	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteModal(false);
	}, []);

	const handleDeleteAccount = async () => {
		await deleteAccount(account.account_id, account.username);
		router.reload();
	};
	return (
		<tr className="user-card">
			<td className="avatar-cell">
				{avatar_url ? (
					<Avatar src={avatar_url} size="96" className="rounded-full" alt={`${username}'s avatar`} />
				) : (
					<Avatar src={'/default-avatar.png'} size="96" className="rounded-full" alt={`${username}'s avatar`} />
				)}
			</td>
			<td>
				<span>Username</span>
				{username}
			</td>
			<td>
				<span>Password</span>••••••••••
			</td>
			<td>
				<span>User Role</span>
				{account_role.role_name}
			</td>
			<td>
				<span>Department</span>
				{account_department.department_name}
			</td>
			<td>
				<span>Created</span>
				{moment(created).format('MMM DD, YYYY')}
			</td>
			<td>
				<div className="flex flex-1 flex-wrap justify-between lg:justify-start lg:gap-4">
					{/* <Link href={`${asPath}/edit/${account_id}`} passHref>
						<a> */}
					<Button onClick={handleShowEditModal} icon className="btn-secondary">
						<Icon name="Edit" size="16" />
						Edit
					</Button>
					{showEditModal && (
						<Modal onCancel={handleCloseEditModal} headerText={`Edit @${username} account`}>
							<EditUserModal account={account} />
						</Modal>
					)}
					{/* </a>
					</Link> */}
					<Button onClick={handleShowDeleteModal} icon className="btn-primary">
						<Icon name="Trash" size="16" />
						Delete
					</Button>
					{showDeleteModal && (
						<Modal onCancel={handleCloseDeleteModal}>
							<div className="flex flex-col gap-6 justify-center">
								<p>
									Are you sure you want to delete this account <span className="font-semi-bold">@{username}</span>?
								</p>
								<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
									{/*TODO: Edit delete button box-shadow*/}
									<Button onClick={handleDeleteAccount} className="btn-danger w-full">
										Delete it
									</Button>
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
	);
};
