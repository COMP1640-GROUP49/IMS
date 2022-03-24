import { useRouter } from 'next/router';
import { createContext, useEffect } from 'react';
import { IUserData } from 'pages/api/auth';
import { useUserData } from 'lib/hooks';

export const UserContext = createContext<IUserData>({
	aud: '',
	id: '',
	created_at: '',
	email: '',
	role: '',
	app_metadata: {},
	user_metadata: {},
});

const PrivateRoute = ({ children }: any) => {
	const user = useUserData();
	const router = useRouter();
	const { asPath } = useRouter();

	useEffect(() => {
		if (user) {
			switch (user?.user_metadata?.role) {
				case '0':
					if (asPath === '/login' || asPath === '/') {
						void router.push('/admin');
					}
					break;
				default:
					if (asPath === '/login' || asPath.includes('/admin')) {
						void router.push('/');
					}
					break;
			}
		} else {
			if (!user) {
				if (asPath === '/?error=server_error&error_description=Database+error+saving+new+user') {
					void router.push({
						pathname: '/login',
						query: { error: 'google account error' },
					});
				} else {
					void router.push({
						pathname: '/login',
					});
				}
			}
		}
	}, [user]);

	return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export default PrivateRoute;
