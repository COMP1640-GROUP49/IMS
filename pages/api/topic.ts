import { ITopicData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

export const getTopicsListByDepartmentId = async (department_id: string, limit?: number) => {
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('topics')
		.select(`*, categories(*,ideas(*))`)
		.match({ department_id: department_id })
		.limit(limit || noLimit);
	return { data, error };
};

export const getTopicById = async (topic_id: string, limit?: number) => {
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('topics')
		.select()
		.match({ topic_id: topic_id })
		.limit(limit || noLimit);
	return { data, error };
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

let topicData: ITopicData;
export const getTopicByName = async (topicName: string) => {
	const { data, error } = await supabase
		.from('topics')
		.select()
		.ilike('topic_name', `${topicName.split('-').join(' ')}`);
	if (data && (data as []).length !== 0) {
		topicData = data[0] as ITopicData;
	}
	return { topicData, error };
};
