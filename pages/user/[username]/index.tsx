import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import { getAccountData, getUsersList } from 'pages/api/admin';
import { IAccountData } from 'lib/interfaces';

interface IParams extends ParsedUrlQuery {
	username: string;
}

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

const UserProfile = ({ data }: any) => {
	const { asPath } = useRouter();
	const {
		username,
		account_email,
		account_role,
		account_full_name,
		account_address,
		account_phone_number,
		avatar_url,
	} = data as IAccountData['account'];
	return (
		<>
			<MetaTags title={`${account_full_name as string} | @${username}'s Profile`} />
			<Header />
			<div className="below-navigation-bar profile-content p-6 items-center">
				{avatar_url ? (
					<Avatar src={`${avatar_url}`} size="128" className="rounded-full" />
				) : (
					<Avatar src={'/default-avatar.png'} size="128" className="rounded-full" />
				)}
				<div className="profile-header">
					<h1>{account_full_name}</h1>
					<p className="-mt-1 font-semi-bold">@{username}</p>
					<p className="text-sonic-silver">{account_role?.role_name}</p>
				</div>
				<div className="profile-content sm:self-stretch">
					<p>Email: {account_email}</p>
					<p>Address: {account_address}</p>
					<p>Phone: {account_phone_number}</p>
				</div>

				<Link href={`${asPath}/edit`} passHref>
					<a className="sm:self-stretch">
						<Button icon className={'btn-primary w-full'}>
							<Icon name="Edit" size="16" color="white" />
							Edit my profile
						</Button>
					</a>
				</Link>
			</div>
		</>
	);
};

export default UserProfile;
