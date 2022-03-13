/* eslint-disable @typescript-eslint/no-misused-promises */
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { MetaTags } from 'components/MetaTags';
import { useUserData } from 'lib/hooks';
import { isEmptyOrUndefined } from 'utils/isEmpty';
import supabase from 'utils/supabase';

const Home: NextPage = () => {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const user = useUserData();

	useEffect(() => {
		const checkAuth = () => {
			if (isLoading) {
				if (isEmptyOrUndefined(user as object)) {
					setIsLoggedIn(false);
				} else {
					setIsLoggedIn(true);
				}
			}
		};
		checkAuth();

		setTimeout(() => {
			try {
				if (isLoading) {
					if (!isLoggedIn && isEmptyOrUndefined(user as object)) {
						setIsLoading(false);
					}
				}
			} catch (error) {
			} finally {
				setIsLoading(false);
			}
		}, 501);

		if (!isLoading) {
			if (!isLoggedIn && isEmptyOrUndefined(user as object)) {
				void router.push('/login');
			}
		}
		return () => {
			setIsLoading(false);
		};
	}, [user, router, isLoading, isLoggedIn]);

	return (
		<main>
			{!isLoading && isLoggedIn && (
				<>
					<MetaTags title="IMS" description="Checkout our home page" />
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
			)}
		</main>
	);
};

export default Home;
