import { CommentCard } from 'components/CommentCard';
import { ICommentData, ICommentsProps, IIdeaData } from 'lib/interfaces';

type CommentListProps = {
	idea: IIdeaData['idea'];
	loadCommentData: (comments: ICommentsProps) => void;
};

export const CommentList = ({ idea, loadCommentData }: CommentListProps) => {
	return (
		<div className="comment-list flex flex-col gap-0">
			{idea.comments &&
				(idea.comments as unknown as []).map((comment: ICommentData['comment']) => (
					<CommentCard loadCommentData={loadCommentData} key={comment.comment_id} comment={comment} />
				))}
		</div>
	);
};
