import { IAccountData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

export const updateProfile = async (
	id: string,
	username: string,
	name: string,
	email: string,
	address: string,
	phone: string
) => {
	const updateUserProfile = async () => {
		const data = await supabase.rpc('update_user_profile', {
			id_val: id,
			name_val: name,
			email_val: email,
			address_val: address,
			phone_val: phone,
		});

		await supabase.auth.refreshSession();
	};
	await notifyToast(
		updateUserProfile(),
		`Update profile data for user @${username}.`,
		`Profile data of @${username} has been updated.`
	);
};

let userData: IAccountData;
export const getAccountByAccountId = async (account_id: string) => {
	const { data, error } = await supabase.from('accounts').select().match({ account_id: account_id });
	if (data && (data as []).length !== 0) {
		userData = data[0] as IAccountData;
	}
	return { userData, error };
};
