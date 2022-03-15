import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
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
	const { asPath } = useRouter();

	return (
		<>
			<MetaTags title="Users Management" description="Manage users of IMS" />
			<Header />
			<main className="body-container flex flex-col gap-6 below-navigation-bar">
				<div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
					<h1>Users</h1>
					<Link href={`${asPath}/create`} passHref>
						<a>
							<Button icon className="btn-primary self-start sm:self-stretch">
								<Icon name="UserPlus" size="16" />
								Create new user account
							</Button>
						</a>
					</Link>
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
