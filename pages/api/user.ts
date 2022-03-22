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
	console.log(id, username, name, address, phone);
	const updateUserProfile = async () => {
		const data = await supabase.rpc('update_user_profile', {
			id_val: id,
			name_val: name,
			email_val: email,
			address_val: address,
			phone_val: phone,
		});
		console.log('🚀 ~ file: user.ts ~ line 12 ~ updateUserProfile ~ data', data);

		await supabase.auth.refreshSession();
	};
	await notifyToast(
		updateUserProfile(),
		`Update profile data for user @${username}.`,
		`Profile data of @${username} has been updated.`
	);
};
