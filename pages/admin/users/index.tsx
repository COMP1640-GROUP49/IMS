import { GetServerSideProps, NextPage } from 'next';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { UserList } from 'components/UserList';
import { getUsersList } from 'pages/api/admin';
import { IAccountsProps } from 'lib/interfaces';

export const getServerSideProps: GetServerSideProps = async () => {
	const { data } = await getUsersList();

	return {
		props: {
			data,
		},
	};
};

const UsersManagement: NextPage<IAccountsProps> = ({ data: accounts }) => {
	return (
		<>
			<Header />
			<main className="body-container flex flex-col gap-6 ">
				<div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
					<h1>Users</h1>
					<Button icon className="btn-primary self-start sm:self-stretch">
						<Icon name="UserPlus" size="16" />
						Create new user account
					</Button>
				</div>
				<UserList accounts={accounts} />
				{/* <Modal isShown={isShown} hide={toggle} headerText="Create Uers" modalContent={<h1>dasdadasdas</h1>} /> */}
			</main>
			{/* <div className="flex flex-col lgs:flex-row lg:justify-between items-start lg:items-center py-7 sm:w-full"> */}

			{/* <UserList />
			{data.map((d) => (
				<div key={`${d.account_id}`}>{d?.username}</div>
			))} */}
		</>
	);
};

export default UsersManagement;
