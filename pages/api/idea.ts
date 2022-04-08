import { IIdeaData } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

export const getIdeasListByCategoryId = async (category_id: string, limit?: number) => {
	// const { data, error } = await supabase.rpc('get_ideas_with_comments', { category_id_val: category_id });
	const noLimit = 99999;
	const { data, error } = await supabase
		.from('ideas')
		.select('*, comments!comments_idea_id_fkey(*), reaction(*)')
		.match({ category_id: category_id })
		.limit(limit || noLimit);
	return { data, error };
};

export const uploadAttachment = async (
	attachmentFile: File,
	department_name: string,
	topic_id: string,
	idea_title: string,
	username: string,
	file_name: string
) => {
	const updateAttachment = async () => {
		const { error } = await supabase.storage
			.from('departments')
			.upload(`${department_name}/topics/${topic_id}/${file_name}-${idea_title}-${username}`, attachmentFile);
		if (error) {
			await supabase.storage
				.from('departments')
				.update(`${department_name}/topics/${topic_id}/${file_name}-${idea_title}-${username}`, attachmentFile, {
					cacheControl: '3600',
					upsert: false,
				});
		}
		return getAttachmentFileUrl();
	};

	const getAttachmentFileUrl = async () => {
		const { signedURL, error } = await supabase.storage
			.from('departments')
			.createSignedUrl(`${department_name}/topics/${topic_id}/${file_name}-${idea_title}-${username}`, 999999999999); // Expired time of signed URL of avatar
		if (signedURL) {
			const url = signedURL;
			return url;
		} else {
			throw error;
		}
	};

	try {
		let attachmentUrl;
		// Check if users bucket exists
		const { data } = await supabase.storage.getBucket(`departments`);

		if (data) {
			try {
				attachmentUrl = await updateAttachment();
			} catch (error) {
				throw new Error('Avatar is not uploaded!');
			}
		} else {
			try {
				await supabase.storage.createBucket(`departments`);
				attachmentUrl = await updateAttachment();
			} catch (error) {
				throw new Error('Bucket is not created!');
			}
		}
		return attachmentUrl;
	} catch (error) {
		throw new Error('Bucket does not exists on the db!');
	}
};

export const createNewIdea = async (ideaForm: IIdeaData['idea']) => {
	let data: any;
	const insertNewTopic = async () => {
		const { data: newIdeaData, error } = await supabase.from('ideas').insert(ideaForm);
		if (newIdeaData) {
			data = newIdeaData[0] as IIdeaData['idea'];
		}

		if (error) {
			throw error;
		}
	};

	await notifyToast(
		insertNewTopic(),
		`Creating new idea with title ${ideaForm.idea_title}.`,
		`Idea ${ideaForm.idea_title} has been created.`
	);
	return data as IIdeaData['idea'];
};
