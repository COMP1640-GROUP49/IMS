import { ParsedUrlQuery } from 'querystring';
import { IObjectKeys } from 'lib/objectKeys';

export interface IAccountData extends IObjectKeys {
	account: {
		account_id: string;
		username: string;
		encrypted_password: string;
		account_role: {
			role_name: string;
		};
		account_department: {
			department_name: string;
		};
		account_email: string;
		account_full_name?: string;
		account_address?: string;
		account_phone_number?: string;
		avatar_url?: string;
		created?: string;
	};
}

export interface IAccountsProps {
	data: IAccountData[];
}

export interface IParams extends ParsedUrlQuery {
	username: string;
}
