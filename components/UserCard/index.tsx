import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { IAccountData } from 'lib/interfaces';

export const UserCard = ({ account }: IAccountData) => {
	const { asPath } = useRouter();
	const { account_id, username, account_role, account_department, avatar_url, created } = account;
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
				{moment(created).format('MMM, DD YYYY')}
			</td>
			<td>
				<div className="flex flex-1 flex-wrap justify-between lg:justify-start lg:gap-4">
					<Link href={`${asPath}/edit/${account_id}`} passHref>
						<a>
							<Button icon className="btn-secondary">
								<Icon name="Edit" size="16" />
								Edit
							</Button>
						</a>
					</Link>
					<Button icon className="btn-primary">
						<Icon name="Trash" size="16" />
						Delete
					</Button>
				</div>
			</td>
		</tr>
	);
};
