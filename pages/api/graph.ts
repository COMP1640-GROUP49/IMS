import supabase from 'utils/supabase';

export const getAllIdeasInEachDepartment = async () => {
	const { data, error } = await supabase.rpc('get_ideas_in_each_department');

	return { data, error };
};

export const getIdeasPercentageInEachDepartment = async () => {
	const { data, error } = await supabase.rpc('get_ideas_percentage_in_each_department');

	return { data, error };
};
