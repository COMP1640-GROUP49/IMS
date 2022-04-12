import { IReactionData } from 'lib/interfaces';
import supabase from 'utils/supabase';

let newReactionState: IReactionData['reaction'];
export const addReactionToIdea = async (ideaId: string, accountId: string, reactionType: string) => {
	const { data, error } = await supabase
		.from('reaction')
		.insert({ idea_id: ideaId, account_id: accountId, reaction_type: reactionType });
	if (data && (data as []).length !== 0) {
		const { reactionState, error } = await getReactionStateOfUserInIdea(accountId, ideaId);
		newReactionState = reactionState;
	}
	return { newReactionState, error };
};

export const removeReactionFromIdea = async (ideaId: string, accountId: string, reactionType: string) => {
	const { data, error } = await supabase
		.from('reaction')
		.delete()
		.match({ idea_id: ideaId, account_id: accountId, reaction_type: reactionType });
	if (data && (data as []).length !== 0) {
		const { reactionState, error } = await getReactionStateOfUserInIdea(accountId, ideaId);
		newReactionState = reactionState;
	}
	return { newReactionState, error };
};

let reactionState: IReactionData['reaction'];
export const getReactionStateOfUserInIdea = async (accountId: string, ideaId: string) => {
	const { data, error } = await supabase.from('reaction').select().match({ account_id: accountId, idea_id: ideaId });
	if (data && (data as []).length !== 0) {
		reactionState = data[0] as IReactionData['reaction'];
	} else {
		reactionState = null!;
	}

	return { reactionState, error };
};
