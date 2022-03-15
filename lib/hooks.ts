import { useEffect, useState } from 'react';
import { IUserData } from 'pages/api/auth';
import supabase from 'utils/supabase';

const initUser = supabase.auth.user();
// const getInitSession = async () => {
// 	const { data, error } = await supabase.auth.getSessionFromUrl();
// 	const session = data || supabase.auth.session();

// 	return session;
// };

// const initSession = await getInitSession();

export const useUserData = () => {
	const [user, setUser] = useState<IUserData>(initUser as IUserData);

	useEffect(() => {
		// console.log(1, initUser);
		const { data: AuthProvider } = supabase.auth.onAuthStateChange((event, session) => {
			// console.log(2);
			if (event == 'SIGNED_IN' && session && session['user']) {
				setTimeout(() => {
					setUser(session['user'] as IUserData);
					// console.log('init', initSession);
					console.log('later', session);
				}, 500);
			} else if (event == 'SIGNED_OUT') {
				setTimeout(() => {
					setUser(null!);
				}, 1);
			}
		});

		return () => {
			AuthProvider?.unsubscribe();
		};
	}, [user]);

	return user;
};
