import { ICommentReactionData } from 'lib/interfaces';
import supabase from 'utils/supabase';

let newCommentReactionState: ICommentReactionData['comment_reaction'];
export const addCommentReactionToComment = async (commentId: string, accountId: string, reactionType: string) => {
	const { data, error } = await supabase
		.from('comments_reaction')
		.insert({ comment_id: commentId, account_id: accountId, comment_reaction_type: reactionType });
	if (data && (data as []).length !== 0) {
		const { commentReactionState, error } = await getCommentReactionStateOfUserInComment(accountId, commentId);
		newCommentReactionState = commentReactionState;
	}
	return { newCommentReactionState, error };
};

export const removeCommentReactionFromComment = async (
	commentId: string,
	accountId: string,
	commentReactionType: string
) => {
	const { data, error } = await supabase
		.from('comments_reaction')
		.delete()
		.match({ comment_id: commentId, account_id: accountId, comment_reaction_type: commentReactionType });
	if (data && (data as []).length !== 0) {
		const { commentReactionState, error } = await getCommentReactionStateOfUserInComment(accountId, commentId);
		newCommentReactionState = commentReactionState;
	}
	return { newCommentReactionState, error };
};

let commentReactionState: ICommentReactionData['comment_reaction'];
export const getCommentReactionStateOfUserInComment = async (accountId: string, commentId: string) => {
	const { data, error } = await supabase
		.from('comments_reaction')
		.select()
		.match({ account_id: accountId, comment_id: commentId });
	if (data && (data as []).length !== 0) {
		commentReactionState = data[0] as ICommentReactionData['comment_reaction'];
	} else {
		commentReactionState = null!;
	}

	return { commentReactionState, error };
};
