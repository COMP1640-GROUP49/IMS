import { IDepartmentData } from 'lib/interfaces';
import supabase from 'utils/supabase';

export const getDepartmentByName = async (department_name: string) => {
	const { data, error } = await supabase
		.from('departments')
		.select('department_id')
		.ilike('department_name', `${department_name} department`);
	const { department_id } = data![0] as IDepartmentData;
	return { department_id, error };
};

export const getDepartmentsList = async (limit?: number) => {
	const noLimit = 99999;

	const { data, error } = await supabase
		.from('departments')
		.select(`*`)
		.limit(limit || noLimit)
		.order('department_id', { ascending: true });
	return { data, error };
};
