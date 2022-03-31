// import { Modal } from 'components/Modal';
// import { useModal } from 'components/UseModal';
// import { UserCard } from 'components/UserCard';
import { ClipLoader } from 'react-spinners';
import { UserCard } from 'components/UserCard';

export const UserList = ({ accounts }: any) => {
	// const { isShown, toggle } = useModal();
	return (
		<div className="flex flex-col gap-6 user-list">
			<div>
				<p className="text-body font-semi-bold users-list">List of users</p>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<thead>
						<tr>
							{['Avatar', 'Username', 'Password', 'User Role', 'Department', 'Created', 'Action'].map((field) => (
								<th key={field}>{field}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{accounts ? (
							(accounts as []).map((account) => <UserCard key={account['account_id']} account={account} />)
						) : (
							<tr>
								<td rowSpan={7}>
									<ClipLoader />
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};
