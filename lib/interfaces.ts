import { IObjectKeys } from 'lib/objectKeys';

export interface IAccountData extends IObjectKeys {
	account: {
		account_id: string;
		username: string;
		encrypted_password: string;
		account_role: {
			role_id?: string;
			role_name?: string;
		};
		account_department: {
			department_id?: string;
			department_name?: string;
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

export interface IDepartmentData extends IObjectKeys {
	department: {
		department_name: string;
		department_id: string;
		topics?: ITopicsProps;
		accounts?: [];
	};
}

export interface IDepartmentsProps {
	data: IDepartmentData[];
}

export interface ITopicData extends IObjectKeys {
	topic: {
		topic_id: string;
		topic_name: string;
		topic_start_date: string;
		topic_first_closure_date: string;
		topic_final_closure_date: string;
		topic_description?: string;
		department_id: number;
		category?: ICategoryDataProps;
	};
}

export interface ITopicsProps {
	data: ITopicData[];
}

export interface ICategoryData extends IObjectKeys {
	category: {
		category_id: string;
		category_name: string;
		category_description?: string;
		topic_id: string;
	};
}

export interface ICategoryDataProps {
	data: ICategoryData;
}
