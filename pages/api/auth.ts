import { User } from '@supabase/supabase-js';
// import bcrypt from 'bcryptjs';
import { IObjectKeys } from 'lib/objectKeys';
import supabase from 'utils/supabase';

export interface IUserData extends User {
	id: string;
	created_at: string;
	email?: string;
	role?: string;
	user_metadata: {
		[key: string]: any;
	};
}

interface IUserResponseData extends IObjectKeys {
	account_email: string;
	account_role?: number;
}

type DataProps = {
	username: string;
	password: string;
};

const accountData: IUserResponseData = {
	account_email: '',
};

export const loginAccount = async ({ username, password }: DataProps) => {
	const { data, error } = await supabase
		.from('accounts')
		.select('account_email, account_role')
		.match({ username: username });

	data!.forEach((accountField: IUserResponseData) => {
		accountData.account_email = accountField['account_email'];
	});

	if (data) {
		const data = await supabase.auth.signIn({
			email: accountData.account_email,
			password: password,
		});

		accountData.account_role = data?.user?.user_metadata?.role as IUserResponseData['account_role'];

		return data;
	}
};

export const loginWithGoogle = async () => {
	try {
		await supabase.auth.signIn({
			provider: 'google',
		});
	} catch (error) {
		throw error;
	}
};

export const logOut = async () => {
	const { error } = await supabase.auth.signOut();

	if (error) {
		throw error;
	}
};
