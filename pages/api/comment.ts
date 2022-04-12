import moment from 'moment';
import { ICommentData, ICommentsProps } from 'lib/interfaces';
import { notifyToast } from 'lib/toast';
import supabase from 'utils/supabase';

let commentData: ICommentData;
export const getCommentById = async (ideaId: string) => {
	const { data, error } = await supabase.from('comments').select().match({ idea_id: ideaId });
	if (data && (data as []).length !== 0) {
		commentData = data[0] as ICommentData;
	}
	return { commentData, error };
};

let replyCommentsList: ICommentsProps;
export const getReplyComments = async (commentId: string) => {
	const { data, error } = await supabase
		.from('comments')
		.select('*, comments_reaction(*)')
		.match({ parent_comment_id: commentId });
	if (data && (data as []).length !== 0) {
		replyCommentsList = data as unknown as ICommentsProps;
	} else {
		replyCommentsList = undefined!;
	}
	return { replyCommentsList, error };
};

export const getAllCommentsByIdeaId = async (ideaId: string, orderBy?: string, ascending?: boolean) => {
	let data: any;

	if ((orderBy && ascending === true) || ascending === false) {
		const { data: commentListData, error } = await supabase
			.from('comments')
			.select('*, comments_reaction(*)')
			.match({ idea_id: ideaId })
			.order(orderBy as string, { ascending: ascending });
		if (commentListData) {
			data = commentListData as unknown as ICommentsProps;
		} else {
			data = undefined;
		}
	} else {
		const { data: commentListData, error } = await supabase
			.from('comments')
			.select('*, comments_reaction(*)')
			.match({ idea_id: ideaId });
		if (commentListData) {
			data = commentListData as unknown as ICommentsProps;
		} else {
			data = undefined;
		}
	}

	return data as ICommentsProps;
};

export const createNewComment = async (commentForm: ICommentData['comment']) => {
	let data: any;
	const insertNewComment = async () => {
		const { data: newCommentData, error } = await supabase.from('comments').insert(commentForm);
		data = newCommentData && (newCommentData[0] as ICommentData['comment']);

		if (error) {
			throw error;
		}
	};

	await notifyToast(insertNewComment(), `Posting your comment.`, `Your comment has been posted.`);
	return data as ICommentData['comment'];
};

export const updateComment = async (commentId: string, commentContent: string) => {
	const insertNewComment = async () => {
		const data = await supabase
			.from('comments')
			.update({ comment_content: commentContent, comment_updated: moment().format() })
			.match({ comment_id: commentId });
	};

	await notifyToast(insertNewComment(), `Updating your comment.`, `Your comment has been updated.`);
};

export const deleteComment = async (commentId: string) => {
	const insertNewComment = async () => {
		const data = await supabase.from('comments').delete().match({ comment_id: commentId });
	};

	await notifyToast(insertNewComment(), `Deleting your comment.`, `Your comment has been deleted.`);
};
