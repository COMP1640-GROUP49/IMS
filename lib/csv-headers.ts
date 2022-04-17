import supabase from 'utils/supabase';
import { IIdeasProps } from './interfaces';

export const headersCSV = [
	{ label: 'Popular Point', key: 'popular_point' },
	{ label: 'Views', key: 'idea_view' },
	{ label: 'Created', key: 'idea_created' },
	{ label: 'Last Updated', key: 'idea_updated' },
	{ label: 'Category', key: 'category_name' },
	{ label: 'Title', key: 'idea_title' },
	{ label: 'Content', key: 'idea_content' },
	{ label: 'Username', key: 'account_username' },
	{ label: 'Full Name', key: 'account_full_name' },
	{ label: 'Post as Anonymous', key: 'anonymous_posting' },
	{ label: 'Attachment Link', key: 'idea_file_url' },
];

let ideaList: IIdeasProps;
export const getIdeasCSV = async (topicId: string) => {
	const { data } = await supabase.rpc('get_ideas_data_csv', { topic_id_val: topicId });
	if (data) {
		ideaList = data as unknown as IIdeasProps;
	}

	return { ideaList };
};
