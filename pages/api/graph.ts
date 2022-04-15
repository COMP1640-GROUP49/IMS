import supabase from 'utils/supabase';

export const getAllIdeasInEachDepartment = async () => {
	const { data, error } = await supabase.rpc('get_ideas_in_each_department');

	return { data, error };
};

export const getContributorsInEachDepartment = async () => {
	const { data, error } = await supabase.rpc('get_contributors_in_each_department');
	return { data, error };
};

export const getIdeasWithoutCommentsInEachDepartment = async () => {
	const { data, error } = await supabase.rpc('get_ideas_without_comments_in_each_department');
	return { data, error };
};

export const getAnonymousIdeasInEachDepartment = async () => {
	const { data, error } = await supabase.rpc('get_anonymous_ideas_in_each_department');
	return { data, error };
};

export const getAnonymousCommentsInEachDepartment = async () => {
	const { data, error } = await supabase.rpc('get_anonymous_comments_in_each_department');
	return { data, error };
};
