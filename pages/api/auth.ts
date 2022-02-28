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
let isAdmin: boolean = false;
let accountRole: number;

export const loginAccount = async ({ username, password }: DataProps) => {
	const { data } = await supabase.from('accounts').select().match({ username: username });

	const salt = bcrypt.genSaltSync(10);
	// Get hash password from db
	data!.forEach((account) => (passwordHash = account['password']));

	const isPasswordValid = bcrypt.compareSync(password, passwordHash);

	// Check password validation
	if (isPasswordValid) {
		data!.forEach((account) => (accountRole = account['account_role']));

		switch (accountRole) {
			case 1:
				isAdmin = true;
				break;

			default:
				isAdmin = false;
				break;
		}
		console.log(accountRole, isAdmin);

		// Check admin role
		if (isAdmin) {
		} else {
			console.log('go to other stuff');
		}
	} else {
		throw new Error('Username or password is incorrect');
	}
};
