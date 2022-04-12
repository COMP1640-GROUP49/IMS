import { IFileData, IIdeaData, IIdeasProps } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

export const getIdeasListByCategoryId = async (
	category_id: string,
	limit?: number,
	sortBy?: string,
	ascending?: boolean
) => {
	const noLimit = 99999;
	if (sortBy || ascending) {
		const { data, error } = await supabase
			.from('ideas')
			.select('*, comments!comments_idea_id_fkey(*), reaction(*)')
			.match({ category_id: category_id })
			.order(sortBy as string, { ascending: ascending })
			.limit(limit || noLimit);
		return { data, error };
	} else {
		const { data, error } = await supabase
			.from('ideas')
			.select('*, comments!comments_idea_id_fkey(*), reaction(*)')
			.match({ category_id: category_id })
			.limit(limit || noLimit);
		return { data, error };
	}
};

export const uploadAttachment = async (
	attachmentFile: File,
	department_name: string,
	topic_id: string,
	idea_title: string,
	account_id: string,
	file_name: string,
	server_file_name?: string,
	old_idea_title?: string
) => {
	let fileData: IFileData;
	const updateAttachment = async () => {
		const { data } = await supabase.storage.from('departments').list(`${department_name}/topics/${topic_id}`);
		if (data && (data as []).length > 0) {
			const filterData = (data as []).filter(
				(file: IFileData) =>
					file.name.includes(old_idea_title as string) &&
					file.name.includes(server_file_name as string) &&
					file.name.includes(account_id)
			);
			fileData = filterData[0];
		}

		// Remove old file on server
		if (data) {
			await supabase.storage.from('departments').remove([`${department_name}/topics/${topic_id}/${fileData?.name}`]);
		}

		// Update new file after removing old file
		const { error } = await supabase.storage
			.from('departments')
			.upload(`${department_name}/topics/${topic_id}/${idea_title}_${file_name}_${account_id}`, attachmentFile);
		if (error) {
			await supabase.storage
				.from('departments')
				.update(`${department_name}/topics/${topic_id}/${idea_title}_${file_name}_${account_id}`, attachmentFile, {
					cacheControl: '3600',
					upsert: false,
				});
		}
		return getAttachmentFileUrl();
	};

	const getAttachmentFileUrl = async () => {
		const { signedURL, error } = await supabase.storage
			.from('departments')
			.createSignedUrl(`${department_name}/topics/${topic_id}/${idea_title}_${file_name}_${account_id}`, 999999999999); // Expired time of signed URL of avatar
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

export const updateIdea = async (ideaForm: IIdeaData['idea']) => {
	let data: any;
	const updateIdeaData = async () => {
		if (ideaForm?.comments && ideaForm?.reaction) {
			delete ideaForm?.comments;
			delete ideaForm.reaction;
		}

		const { data: updateIdeaData, error } = await supabase
			.from('ideas')
			.update(ideaForm)
			.match({ idea_id: ideaForm.idea_id });
		if (updateIdeaData) {
			data = updateIdeaData[0] as IIdeaData['idea'];
		}

		if (error) {
			throw error;
		}
	};

	await notifyToast(
		updateIdeaData(),
		`Updating idea ${ideaForm.idea_title}.`,
		`Idea ${ideaForm.idea_title} has been updated.`
	);
	return data as IIdeaData['idea'];
};

let fileData: IFileData;
export const removeIdeaAttachment = async (
	idea_title: string,
	department_name: string,
	topic_id: string,
	account_id: string
) => {
	const { data } = await supabase.storage.from('departments').list(`${department_name}/topics/${topic_id}`);
	if (data && (data as []).length > 0) {
		const filterData = (data as []).filter(
			(file: IFileData) => file.name.includes(idea_title) && file.name.includes(account_id)
		);
		fileData = filterData[0];
	}

	// Remove old file on server
	if (data) {
		await supabase.storage.from('departments').remove([`${department_name}/topics/${topic_id}/${fileData?.name}`]);
	}
};

export const deleteIdea = async (
	idea_id: string,
	idea_title: string,
	department_name: string,
	topic_id: string,
	account_id: string
) => {
	const deleteIdeaData = async () => {
		const { data, error } = await supabase.from('ideas').delete().match({
			idea_id: idea_id,
		});
		await removeIdeaAttachment(idea_title, department_name, topic_id, account_id);
		if (error) {
			throw error;
		}
	};
	await notifyToast(deleteIdeaData(), `Deleting idea ${idea_title}.`, `Topic named ${idea_title} has been deleted.`);
};

let ideaData: IIdeaData;
export const getIdeaById = async (ideaId: string, order_by?: string, ascending?: boolean) => {
	if (order_by && ascending) {
		const { data, error } = await supabase
			.from('ideas')
			.select('*, comments!comments_idea_id_fkey(*, comments_reaction(*)), reaction(*)')
			.match({ idea_id: ideaId })
			.order(order_by, { ascending: ascending });
		if (data) {
			ideaData = data[0] as IIdeaData;
		} else {
			ideaData = undefined!;
		}
	} else {
		const { data, error } = await supabase
			.from('ideas')
			.select('*, comments!comments_idea_id_fkey(*, comments_reaction(*)), reaction(*)')
			.match({ idea_id: ideaId })
			.order('idea_created', { ascending: false })
			.order('comment_created', { foreignTable: 'comments', ascending: false });
		if (data) {
			ideaData = data[0] as IIdeaData;
		} else {
			ideaData = undefined!;
		}
	}

	return { ideaData };
};

export const increaseViewCountBy1 = async (ideaId: string, currentViewCount: number) => {
	const { data, error } = await supabase
		.from('ideas')
		.update({ idea_view: ++currentViewCount })
		.match({ idea_id: ideaId });
	return { data, error };
};
