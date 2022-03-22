/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { getAccountData, getUsersList } from 'pages/api/admin';
import { IAccountData, IParams } from 'lib/interfaces';

export const getStaticPaths: GetStaticPaths = async () => {
	const { data } = await getUsersList();
	const paths = data?.map((account: IAccountData) => {
		return {
			params: {
				username: account?.username,
			},
		};
	});
	return {
		paths: paths as [],
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const { username } = params as IParams;
	const data = await getAccountData('', username);
	return {
		props: {
			data,
		},
		revalidate: 10,
	};
};

const Username = ({ data }: any) => {
	const { asPath } = useRouter();
	const { account_email, account_role, account_full_name, account_address, account_phone_number, avatar_url } =
		data as IAccountData['account'];
	return (
		<Fragment>
			<Header />
			<div className="below-navigation-bar flex justify-center p-6">
				<div className="profile-content">
					<div className="profile-content items-center">
						{avatar_url ? (
							<Avatar src={`${avatar_url}`} size="56" className="rounded-full" />
						) : (
							<Avatar src={'/default-avatar.png'} size="128" className="rounded-full" />
						)}
						<div className="text-center">
							<h2>{account_full_name}</h2>
							<p className="text-sonic-silver">{account_role?.role_name}</p>
						</div>
					</div>
					<div className="profile-content">
						<p>Email: {account_email}</p>
						<p>Address: {account_address}</p>
						<p>Phone: {account_phone_number}</p>
					</div>
					<div className="profile-content items-center">
						<Link href={`${asPath}/edit`} passHref>
							<a>
								<Button type="submit" icon={true} className={'btn-primary text-base'}>
									<Icon name="Edit" size="16" color="white" />
									Edit my profile
								</Button>
							</a>
						</Link>
					</div>
				</div>
			</div>
		</Fragment>
	);
};

export default Username;
