import { IObjectKeys } from 'lib/objectKeys';

export interface IFileData {
	created_at: string;
	id: string;
	last_accessed_at: string;
	metadata: {
		[key: string]: any;
		size: number;
	};
	name: string;
	updated_at: string;
}

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
		categories?: ICategoriesProps;
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
		ideas?: [];
	};
}

export interface ICategoriesProps {
	data: ICategoryData[];
}

export interface IIdeaData extends IObjectKeys {
	idea: {
		idea_id: string;
		idea_title: string;
		idea_view: number;
		idea_content: string;
		idea_file_url: string;
		idea_created: string;
		idea_updated: string;
		account_id: string;
		category_id: string;
		anonymous_posting: boolean;
		reaction?: IReactionProps;
		comments?: ICommentsProps;
		popular_point?: number;
	};
}

export interface IIdeasProps {
	data: IIdeaData[];
}

export interface IReactionData extends IObjectKeys {
	reaction: {
		reaction_id: string;
		reaction_type: string;
		reaction_created: string;
		account_id: string;
		idea_id: string;
	};
}

export interface IReactionProps {
	data: IReactionData[];
}
export interface ICommentData extends IObjectKeys {
	comment: {
		comment_id: string;
		comment_content: string;
		comment_file_url: string;
		comment_created: string;
		comment_updated: string;
		account_id: string;
		idea_id: string;
		parent_comment_id: string;
		anonymous_posting: boolean;
		comments_reaction?: ICommentsReactionProps;
	};
}

export interface ICommentsProps {
	data: ICommentData[];
}

export interface ICommentReactionData extends IObjectKeys {
	comment_reaction: {
		comment_reaction_id: string;
		comment_reaction_type: string;
		comment_reaction_created: string;
		account_id: string;
		idea_id: string;
	};
}

export interface ICommentsReactionProps {
	data: ICommentReactionData[];
}
