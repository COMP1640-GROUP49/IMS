import { GetStaticPaths, GetStaticProps } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { getAccountData, getUsersList } from 'pages/api/admin';
import { IAccountData } from 'lib/interfaces';

interface IParams extends ParsedUrlQuery {
	account_id: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
	const { data } = await getUsersList();
	const paths = data?.map((account: IAccountData) => {
		return {
			params: { account_id: account?.account_id },
		};
	});

	return {
		paths: paths as [],
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const { account_id } = params as IParams;
	const data = await getAccountData(account_id);
	return {
		props: {
			data,
		},
		revalidate: 10,
	};
};

const EditModal = ({ data }: IAccountData) => {
	return (
		<div>
			Edit
			<div>Username:{(data as IAccountData).username}</div>
		</div>
	);
};

export default EditModal;
