import { IUserData } from 'pages/api/auth';
import { IAccountData } from 'lib/interfaces';
import { IObjectKeys } from 'lib/objectKeys';
import { notifyToast } from 'lib/toast';
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

	return data!.length !== 0;
};

export const CheckEmailExisted = async (email: string) => {
	const { data } = await supabase.from('accounts').select('account_email').match({
		account_email: email,
	});
	return data!.length !== 0;
};

let newUserData: IUserData;
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
	const adminSession = supabase.auth.session();

	try {
		const creatingNewUserAccount = async () => {
			const { user, error } = await supabase.auth.signUp(
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
			if (error) {
				throw error.message;
			} else {
				newUserData = user as IUserData;
			}
		};
		await notifyToast(
			creatingNewUserAccount(),
			`Creating account for user @${username}.`,
			`Account @${username} has been created.`
		);

		return { newUserData, adminSession };
	} catch (error) {
		throw error;
	}
};

export const updateAccount = async (
	id: string,
	username?: string,
	password?: string,
	role?: string,
	department?: string,
	email?: string,
	full_name?: string,
	address?: string,
	phone?: string
) => {
	try {
		const updateUserData = async () => {
			const data = await supabase.rpc('update_user_data', {
				id_val: id,
				username_val: username,
				password_val: password,
				role_val: role,
				department_val: department,
				email_val: email,
				full_name_val: full_name,
				address_val: address,
				phone_val: phone,
			});
		};

		await notifyToast(
			updateUserData(),
			`Update account data for user @${username as string}.`,
			`Account @${username as string} has been updated.`
		);
	} catch (error) {}
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
		const { signedURL, error } = await supabase.storage
			.from('users')
			.createSignedUrl(`${username}/avatars/${username}-avatar`, 999999999999); // Expired time of signed URL of avatar
		if (signedURL) {
			const url = signedURL;
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

export const getUsersList = async (limit?: number) => {
	const noLimit = 99999;

	const { data, error } = await supabase
		.from('accounts')
		.select(
			`*,
		account_role: account_roles(role_id, role_name),
		account_department:  departments(department_id, department_name)`
		)
		.limit(limit || noLimit)
		.order('created', { ascending: false });
	return { data, error };
};

/**
 * Due to issues of signUp() from Supabase (auto signIn after signUp)
 * https://github.com/supabase/gotrue-js/pull/249
 */
export const keepAdminSession = async (refreshToken: string) => {
	await supabase.auth.setSession(refreshToken);
};

export const getAccountData = async (account_id?: string, username?: string) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	if (username) {
		const { data } = await supabase
			.from<IAccountData>('accounts')
			.select(
				`*,
		account_role: account_roles(role_name),
		account_department: departments(department_name)
	`
			)
			.match({ username: username })
			.single();
		return data as IAccountData;
	} else {
		const { data } = await supabase
			.from<IAccountData>('accounts')
			.select(
				`*,
		account_role: account_roles(role_name),
		account_department: departments(department_name)
	`
			)
			.match({ account_id: account_id })
			.single();
		return data as IAccountData;
	}
};

export const updateUserAvatar = async (id: string, avatarUrl: string) => {
	const data = await supabase.rpc('update_user_avatar', { id_val: id, avatar_url: avatarUrl });
	return data;
};

export const modifyAvatarStorage = async (oldUsername: string, newUsername?: string) => {
	newUsername &&
		(await supabase.storage
			.from('users')
			.copy(`${oldUsername}/avatars/${oldUsername}-avatar`, `${newUsername}/avatars/${newUsername}-avatar`));
	await supabase.storage.from('users').remove([`${oldUsername}/avatars/${oldUsername}-avatar`]);
};

export const deleteAccount = async (id: string, username: string) => {
	const deleteUserData = async () => {
		await supabase.rpc('delete_user_data', { id_val: id });
	};

	await modifyAvatarStorage(username);

	await notifyToast(
		deleteUserData(),
		`Deleting account of user @${username}.`,
		`Account @${username} has been deleted.`
	);
};
