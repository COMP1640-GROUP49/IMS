import { ICategoriesProps, ICategoryData, IIdeasProps, ITopicData, ITopicsProps, IIdeaData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

export const getTopicsListByDepartmentId = async (department_id: string, limit?: number) => {
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('topics')
		.select(`*, categories(topic_id, ideas(category_id))`)
		.match({ department_id: department_id })
		.limit(limit || noLimit);
	return { data, error };
};

let topic: ITopicData;
export const getTopicById = async (topic_id: string, limit?: number) => {
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('topics')
		.select()
		.match({ topic_id: topic_id })
		.limit(limit || noLimit);

	if (data) {
		topic = data[0] as ITopicData;
	}
	return { data: topic, error };
};

export const createNewTopic = async (topicForm: ITopicData['topic']) => {
	const insertNewTopic = async () => {
		const { data, error } = await supabase.from('topics').insert(topicForm);
		if (error) {
			throw error;
		}
	};
	await notifyToast(
		insertNewTopic(),
		`Creating new topic named ${topicForm.topic_name}.`,
		`Topic named ${topicForm.topic_name} has been created.`
	);
};

export const updateTopic = async (topicForm: ITopicData['topic']) => {
	const updateTopic = async () => {
		topicForm?.categories && delete topicForm?.categories;
		const { data, error } = await supabase.from('topics').update(topicForm).match({
			topic_id: topicForm.topic_id,
		});
		if (error) {
			throw error;
		}
	};
	await notifyToast(
		updateTopic(),
		`Updating topic named ${topicForm.topic_name}.`,
		`Topic named ${topicForm.topic_name} has been updated.`
	);
};

export const deleteTopic = async (topic_id: string, topic_name: string) => {
	const deleteTopic = async () => {
		const { data, error } = await supabase.from('topics').delete().match({
			topic_id: topic_id,
		});
		if (error) {
			throw error;
		}
	};
	await notifyToast(
		deleteTopic(),
		`Deleting topic named ${topic_name}.`,
		`Topic named ${topic_name} has been deleted.`
	);
};

let topicData: ITopicData['topic'];
export const getTopicByName = async (topicName: string) => {
	const { data, error } = await supabase
		.from('topics')
		.select('*, categories(*, ideas(*))')
		.ilike('topic_name', `${topicName.split('-').join(' ')}`);
	if (data && (data as []).length !== 0) {
		topicData = data[0] as ITopicData['topic'];
	}
	return { topicData, error };
};

let topicId: string;
export const getTopicIdByCategoryId = async (category_id: string) => {
	const { data, error } = await supabase.from('categories').select('topic_id').match({ category_id: category_id });
	if (data && (data as []).length !== 0) {
		topicId = (data[0] as ITopicData['topic']).topic_id;
	}
	return { topicId, error };
};

let ideaTopicData: ITopicData['topic'];
let ideaTopicCategories: ICategoriesProps;
let ideaList: IIdeasProps;

let ideaData: IIdeaData['idea'];
export const getIdeaByName = async (ideaName: string) => {
	const { data, error } = await supabase
		.from('ideas')
		.select('*, comments!comments_idea_id_fkey(*), reaction(*))')
		.ilike('idea_id', `${ideaName.split('-').join(' ')}`);
	if (data && (data as []).length !== 0) {
		ideaData = data[0] as IIdeaData['idea'];
	}
	return { ideaData, error };
};

export const getAllIdeasByTopicId = async (topicId: string, limit?: number, sortBy?: string, ascending?: boolean) => {
	const noLimit = 999999;
	if (sortBy || ascending) {
		const { data, error } = await supabase
			.from('topics')
			.select(`*, categories(ideas(*, comments!comments_idea_id_fkey(*), reaction(*)))`)
			.match({ topic_id: topicId })
			.order(sortBy as string, { foreignTable: 'categories.ideas', ascending: ascending as boolean });
		if (data && (data as []).length !== 0) {
			ideaTopicData = data[0] as ITopicData['topic'];
			ideaTopicCategories = ideaTopicData.categories as ICategoriesProps;

			const tempResult: any[] = [];
			(ideaTopicCategories as unknown as []).map((idea) =>
				(idea['ideas'] as []).forEach((idea) => tempResult.push(idea))
			);
			ideaList = tempResult as unknown as IIdeasProps;
		}
	} else {
		const { data, error } = await supabase
			.from('topics')
			.select(`*, categories(ideas(*, comments!comments_idea_id_fkey(*), reaction(*)))`)
			.match({ topic_id: topicId })
			.order('popular_point', { foreignTable: 'categories.ideas', ascending: false });

		if (data && (data as []).length !== 0) {
			ideaTopicData = data[0] as ITopicData['topic'];
			ideaTopicCategories = ideaTopicData.categories as ICategoriesProps;

			const tempResult: any[] = [];
			(ideaTopicCategories as unknown as []).map((idea) =>
				(idea['ideas'] as []).forEach((idea) => tempResult.push(idea))
			);
			ideaList = tempResult as unknown as IIdeasProps;
		}
	}
	return { ideaList };
};
