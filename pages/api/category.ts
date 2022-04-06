import { ICategoryData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

export const getCategoriesListByTopicsId = async (topic_id: string, limit?: number) => {
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('categories')
		.select('*,ideas(category_id)')
		.match({ topic_id: topic_id })
		.limit(limit || noLimit)
		.order('category_name', {
			ascending: true,
		});
	return { data, error };
};

export const createNewCategory = async (categoryForm: ICategoryData['category']) => {
	const insertNewCategory = async () => {
		const { data, error } = await supabase.from('categories').insert(categoryForm);
		if (error) {
			throw error;
		}
	};
	await notifyToast(
		insertNewCategory(),
		`Creating new category named ${categoryForm.category_name}.`,
		`Category named ${categoryForm.category_name} has been created.`
	);
};

export const updateCategory = async (categoryForm: ICategoryData['category']) => {
	const updateCategory = async () => {
		categoryForm?.ideas && delete categoryForm?.ideas;
		const { data, error } = await supabase.from('categories').update(categoryForm).match({
			category_id: categoryForm.category_id,
		});
		if (error) {
			throw error;
		}
	};

	await notifyToast(
		updateCategory(),
		`Updating category name ${categoryForm.category_name}.`,
		`Category named ${categoryForm.category_name} has been updated.`
	);
};

export const deleteCategory = async (category_id: string, category_name: string) => {
	const deleteCategory = async () => {
		const { data, error } = await supabase.from('categories').delete().match({
			category_id: category_id,
		});
		if (error) {
			throw error;
		}
	};
	await notifyToast(
		deleteCategory(),
		`Delete category named ${category_name}.`,
		`Category named ${category_name} has been delete`
	);
};
