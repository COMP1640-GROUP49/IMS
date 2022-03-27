import { IDepartmentsData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

export const getDepartmentList = async (limit?: number) => {
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('departments')
		.select('*')
		.limit(limit || noLimit);
	return { data, error };
};
let newDepartment: IDepartmentsData;
export const createDepartment = async ({ department_name }: IDepartmentsData) => {
	const { data: count } = await supabase.from('departments').select('*', { count: 'exact' });

	try {
		const creatingDepartment = async () => {
			const { data, error } = await supabase.from('departments').insert({
				department_id: count?.length,
				department_name: department_name,
			});
			if (error) {
				throw error.message;
			} else {
				newDepartment = data as unknown as IDepartmentsData;
			}
		};
		await notifyToast(
			creatingDepartment(),
			`Creating department for @${department_name as string}.`,
			`Department @${department_name as string} has been created.`
		);
		return newDepartment;
	} catch (error) {
		throw error;
	}
};
export const updateDepartment = async (department_name: string, department_id: string) => {
	try {
		const updateDepartmentData = async () => {
			await supabase
				.from('departments')
				.update({ department_name: department_name })
				.match({ department_id: department_id });
		};
		await notifyToast(
			updateDepartmentData(),
			`Update department data for @${department_name}.`,
			`Department @${department_name} has been updated.`
		);
	} catch (error) {}
};

export const deleteDepartment = async (department_id: string, department_name: string) => {
	const deleteDepartment = async () => {
		await supabase.from('cities').delete().match({ department_id: department_id });
	};
	await notifyToast(
		deleteDepartment(),
		`Deleting department of @${department_name}.`,
		`Department @${department_name} has been deleted.`
	);
};

export const checkDepartmentExisted = async (department_name: string) => {
	const { data } = await supabase.from('departments').select('department_name').match({
		department_name: department_name,
	});

	return data!.length !== 0;
};
