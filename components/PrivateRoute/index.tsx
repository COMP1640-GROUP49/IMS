import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUserData } from 'lib/hooks';

const PrivateRoute = ({ children }: any) => {
	const user = useUserData();
	const router = useRouter();

	useEffect(() => {
		try {
			if (user) {
				switch (user?.user_metadata?.role) {
					case '0':
						void router.push('/admin');
						break;
					default:
						void router.push('/');
						break;
				}
			} else {
				void router.push('/login');
			}
		} catch (error) {}
	}, [user]);

	return <>{children}</>;
};

export default PrivateRoute;
