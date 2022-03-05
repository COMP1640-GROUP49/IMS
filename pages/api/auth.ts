/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import bcrypt from 'bcryptjs';
import supabase from 'utils/supabase';

type DataProps = {
	username: string;
	password: string;
};

let passwordHash: string = '';
let routeName: string = '';
let accountRole: number;

export const loginAccount = async ({ username, password }: DataProps) => {
	const { data } = await supabase.from('accounts').select().match({ username: username });

	// Get hash password from db
	data!.forEach((account) => (passwordHash = account['password']));

	const isPasswordValid = bcrypt.compareSync(password, passwordHash);

	// Check password validation
	if (isPasswordValid) {
		data!.forEach((account) => (accountRole = account['account_role']));

		switch (accountRole) {
			case 1:
				routeName = 'admin';
				break;

			default:
				routeName = '';
				break;
		}
		return routeName;
	} else {
		throw new Error('Username or password is incorrect');
	}
};

export const loginWithGoogle = async () => {
	try {
		const { user, session, error } = await supabase.auth.signIn({
			provider: 'google',
		});
	} catch (error) {
		console.error(error);
	}
};
