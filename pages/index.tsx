/* eslint-disable @typescript-eslint/no-misused-promises */
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { ClipLoader } from 'react-spinners';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { MetaTags } from 'components/MetaTags';
import { UserContext } from 'components/PrivateRoute';
import supabase from 'utils/supabase';

const Home: NextPage = () => {
	const router = useRouter();
	const user = useContext(UserContext);

	return (
		<>
			<MetaTags title="IMS" />
			<Header />
			<Button
				className="btn-google"
				onClick={async () => {
					await supabase.auth.signOut();
					await router.push('login');
				}}
			>
				Log Out
			</Button>
		</>
	);
};

export default Home;
