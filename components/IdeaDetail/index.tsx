/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import Attachment from 'components/Attachment';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { CommentInput } from 'components/CommentInput';
import { CommentList } from 'components/CommentList';
import { Icon } from 'components/Icon';
import { UserContext } from 'components/PrivateRoute';
import RichTextEditor from 'components/RichTextEditor';
import { getIdeaById, increaseViewCountBy1 } from 'pages/api/idea';
import { addReactionToIdea, getReactionStateOfUserInIdea, removeReactionFromIdea } from 'pages/api/reaction';
import { getAccountByAccountId } from 'pages/api/user';
import { IAccountData, ICommentsProps, IIdeaData, IReactionData } from 'lib/interfaces';

const IdeaDetail = ({ idea: ideaData }: IIdeaData) => {
	const [idea, setIdea] = useState<IIdeaData['idea']>(ideaData);
	const [avatarUrl, setAvatarUrl] = useState('');
	const [user, setUser] = useState<IAccountData['account']>();
	const [reactionState, setReactionState] = useState<IReactionData['reaction']>();
	const currentUser = useContext(UserContext);

	const loadCommentData = (comments: ICommentsProps) => {
		setIdea({
			...ideaData,
			comments: comments,
		});
	};

	const reloadIdeaData = async () => {
		const { ideaData } = await getIdeaById(idea.idea_id, 'comment_created', false);
		setIdea(ideaData as unknown as IIdeaData['idea']);
	};

	const handleLikeIdea = async () => {
		if (reactionState?.reaction_type === 'like') {
			const { newReactionState } = await removeReactionFromIdea(idea.idea_id, currentUser.id, 'like');
			setReactionState(newReactionState);
		} else {
			const { newReactionState: removeDislike } = await removeReactionFromIdea(idea.idea_id, currentUser.id, 'dislike');
			const { newReactionState } = await addReactionToIdea(idea.idea_id, currentUser.id, 'like');
			setReactionState(newReactionState);
		}
		void reloadIdeaData();
	};

	const handleDislikeIdea = async () => {
		if (reactionState?.reaction_type === 'dislike') {
			const { newReactionState } = await removeReactionFromIdea(idea.idea_id, currentUser.id, 'dislike');
			setReactionState(newReactionState);
		} else {
			const { newReactionState: removeLike } = await removeReactionFromIdea(idea.idea_id, currentUser.id, 'like');
			const { newReactionState } = await addReactionToIdea(idea.idea_id, currentUser.id, 'dislike');
			setReactionState(newReactionState);
		}
		void reloadIdeaData();
	};

	useEffect(() => {
		void increaseViewCountBy1(idea.idea_id, idea.idea_view);
		const getAdditionalInfo = async () => {
			const { userData } = await getAccountByAccountId(idea.account_id);
			setAvatarUrl(userData?.avatar_url as string);
			setUser(userData);

			const { reactionState } = await getReactionStateOfUserInIdea(currentUser.id, idea.idea_id);
			setReactionState(reactionState);
		};

		void getAdditionalInfo();
	}, [idea, currentUser]);
	return (
		<>
			<div className="flex flex-col gap-6 justify-between">
				<div className="flex justify-between gap-2 items-center">
					<div className="flex gap-2 flex-row items-center">
						{avatarUrl && !idea.anonymous_posting ? (
							<Avatar
								src={`${avatarUrl}`}
								size="48"
								className="rounded-full"
								alt={`${user?.avatar_url as string}'s avatar`}
							/>
						) : (
							<Avatar src={'/default-avatar.png'} size="48" className="rounded-full" alt={`{}'s avatar`} />
						)}

						<div className="flex flex-col gap-1">
							<p className="font-semi-bold">{!idea.anonymous_posting ? user?.account_full_name : 'Anonymous'}</p>
							<p className="text-footer text-sonic-silver font-semi-bold">
								{!idea.anonymous_posting ? `@${user?.username as string}` : 'Anonymous'}
							</p>
						</div>
					</div>

					<p className="text-footer font-light">{moment(idea.idea_created).fromNow()} </p>
				</div>
				<div className="idea-content__disabled-editor">
					<RichTextEditor
						className="disabled-editor"
						value={idea?.idea_content || '<em>No content</em>'}
						readOnly={true}
						placeholder={`Input idea's content`}
					/>
				</div>
				{idea?.idea_file_url && (
					<Attachment idea_title={idea.idea_title} account_id={idea.account_id} value={idea?.idea_file_url} />
				)}

				<div className="flex flex-row gap-2">
					<Button
						onClick={handleLikeIdea}
						icon
						className={`${
							reactionState?.reaction_type === 'like' ? 'btn-reaction__enabled' : ''
						}  btn-secondary btn-reaction`}
					>
						<Icon name="ThumbsUp" size="16" />
						<p>
							{
								(idea.reaction as unknown as []).filter(
									(reaction: IReactionData['reaction']) => reaction.reaction_type === 'like'
								).length
							}
						</p>
					</Button>
					<Button
						onClick={handleDislikeIdea}
						icon
						className={`${
							reactionState?.reaction_type === 'dislike' ? 'btn-reaction__enabled' : ''
						}  btn-secondary btn-reaction`}
					>
						<Icon name="ThumbsDown" size="16" />
						<p>
							{
								(idea.reaction as unknown as []).filter(
									(reaction: IReactionData['reaction']) => reaction.reaction_type === 'dislike'
								).length
							}
						</p>
					</Button>
					<Button icon className={`btn-secondary btn-reaction`}>
						<Icon name="MessageSquare" size="16" />
						<p>
							{(idea.comments as unknown as []).length > 1
								? `${(idea.comments as unknown as []).length} comments`
								: `${(idea.comments as unknown as []).length} comment`}
						</p>
					</Button>
				</div>
			</div>
			{(idea.comments as unknown as []).length > 0 && <hr className="line-divider" />}
			<CommentList loadCommentData={loadCommentData} idea={idea} />
			<hr className="line-divider" />
			<CommentInput loadCommentData={loadCommentData} idea={idea} user={currentUser} />
		</>
	);
};
export default IdeaDetail;