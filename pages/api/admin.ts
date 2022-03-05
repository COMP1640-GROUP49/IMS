import { IObjectKeys } from 'lib/objectKeys';
import supabase from 'utils/supabase';

export interface IFormData extends IObjectKeys {
	email: string;
	username: string;
	password: string;
	role: string;
	department: string;
	full_name?: string;
	address?: string;
	phone_number?: string;
	avatar?: string;
}

export const checkUsernameExisted = async (username: string) => {
	const { data } = await supabase.from('accounts').select('username').match({
		username: username,
	});

	return data;
};

export const createNewAccount = async ({
	email,
	username,
	password,
	role,
	department,
	full_name,
	address,
	phone,
	avatar,
}: IFormData) => {
	try {
		console.log(email, username, password, role, department, full_name, address, phone, avatar);
		const data = await supabase.auth.signUp(
			{
				email: email,
				password: password,
			},
			{
				data: {
					username: username,
					role: role,
					department: department,
					full_name: full_name,
					address: address,
					phone: phone,
					avatar: avatar,
				},
			}
		);
		console.log('🚀 ~ file: admin.ts ~ line 45 ~ data', data);
	} catch (error) {
		throw error;
	}
};

export const uploadAvatar = async (avatarFile: File, username: string) => {
	const updateAvatar = async () => {
		const { error } = await supabase.storage.from('users').upload(`${username}/avatars/${username}-avatar`, avatarFile);
		if (error) {
			await supabase.storage.from('users').update(`${username}/avatars/${username}-avatar`, avatarFile, {
				cacheControl: '3600',
				upsert: false,
			});
		}
		return getAvatarFileUrl();
	};

	const getAvatarFileUrl = async () => {
		const { data, error } = await supabase.storage.from('users').download(`${username}/avatars/${username}-avatar`);
		if (data) {
			const url = URL.createObjectURL(data);
			return url;
		} else {
			throw error;
		}
	};

	try {
		let avatarUrl;
		// Check if users bucket exists
		const { data } = await supabase.storage.getBucket(`users`);

		if (data) {
			try {
				avatarUrl = await updateAvatar();
			} catch (error) {
				throw new Error('Avatar is not uploaded!');
			}
		} else {
			try {
				await supabase.storage.createBucket(`users`);
				avatarUrl = await updateAvatar();
			} catch (error) {
				throw new Error('Bucket is not created!');
			}
		}
		return avatarUrl;
	} catch (error) {
		throw new Error('Bucket does not exists on the db!');
	}
};
