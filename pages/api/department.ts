import { IDepartmentData, ITopicData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

let departmentData: IDepartmentData;
export const getDepartmentByName = async (department_name: string) => {
	const { data, error } = await supabase
		.from('departments')
		.select('department_id')
		.ilike('department_name', `${department_name} departments`);
	if (data && (data as []).length !== 0) {
		departmentData = data[0] as IDepartmentData;
	} else {
		const { data, error } = await supabase
			.from('departments')
			.select('department_id')
			.ilike('department_name', `${department_name} department`);

		if (data && (data as []).length !== 0) {
			departmentData = data[0] as IDepartmentData;
		} else {
			const { data, error } = await supabase
				.from('departments')
				.select('department_id')
				.ilike('department_name', `${department_name}`);
			if (data) {
				departmentData = data[0] as IDepartmentData;
			}
		}
	}
	const { department_id } = departmentData;
	return { department_id, error };
};

export const getDepartmentNameById = async (id: string) => {
	const { data, error } = await supabase.from('departments').select('department_name').match({ department_id: id });
	if (data && (data as []).length !== 0) {
		departmentData = data[0] as unknown as IDepartmentData;
	}
	const { department_name } = departmentData;
	return { department_name, error };
};

export const getDepartmentList = async (limit?: number) => {
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('departments')
		.select()
		.order('department_id', { ascending: true })
		.limit(limit || noLimit);
	return { data, error };
};

export const getDepartmentTopics = async (limit?: number) => {
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('departments')
		.select(`*, topics(*, categories(category_name)), accounts(username)`)
		.order('department_name', { ascending: true })
		.limit(limit || noLimit);
	return { data, error };
};

let newDepartment: IDepartmentData;
export const createDepartment = async ({ department_name }: IDepartmentData) => {
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
				newDepartment = data as unknown as IDepartmentData;
			}
		};
		await notifyToast(
			creatingDepartment(),
			`Creating department for ${department_name as string}.`,
			`Department ${department_name as string} has been created.`
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
			`Update department data for ${department_name}.`,
			`Department ${department_name} has been updated.`
		);
	} catch (error) {}
};

export const deleteDepartment = async (department_id: string, department_name: string) => {
	const deleteDepartment = async () => {
		await supabase.from('departments').delete().match({ department_id: department_id });
	};
	await notifyToast(
		deleteDepartment(),
		`Deleting department of ${department_name}.`,
		`Department ${department_name} has been deleted.`
	);
};

// export const checkDepartmentExisted = async (department_name: string) => {
// 	const { data } = await supabase.from('departments').select('department_name').match({
// 		department_name: department_name,
// 	});

// 	return data!.length !== 0;
// };

// export const getDepartmentData = async (topic_name: string) => {
// 	const noLimit = 99999;
// 	const { data, error } = await supabase
// 		.from<IDepartmentData>('topics')
// 		.select(`*, categories(topic_id)`)
// 		.match({ topic_name: topic_name })
// 		.single();
// 	return { data, error };
// };

// export const getTopicList =
