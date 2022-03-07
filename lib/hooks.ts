import { useEffect, useState } from 'react';
import { IUserData } from 'pages/api/auth';
import supabase from 'utils/supabase';

export const useUserData = () => {
	const [user, setUser] = useState<IUserData>();

	useEffect(() => {
		const { data: AuthProvider } = supabase.auth.onAuthStateChange((event, session) => {
			if (event == 'SIGNED_IN' && session && session['user']) {
				setUser(session['user']);
			}
		});

		return () => {
			AuthProvider?.unsubscribe();
		};
	}, []);

	if (!user) {
		const userData = supabase.auth.user();
		userData && setUser(userData);
	}

	return user;
};
