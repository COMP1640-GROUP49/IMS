import { ICommentData } from 'lib/interfaces';
import supabase from 'utils/supabase';

let commentData: ICommentData;
export const getCommentById = async (ideaId: string) => {
	const { data, error } = await supabase.from('comments').select().match({ idea_id: ideaId });
	if (data && (data as []).length !== 0) {
		commentData = data[0] as ICommentData;
	}
	return { commentData, error };
};
