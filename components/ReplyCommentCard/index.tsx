/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { MoreMenu } from 'components/Menu';
import { ReplyCommentEditor } from 'components/ReplyCommentEditor';
import RichTextEditor from 'components/RichTextEditor';
import { IUserData } from 'pages/api/auth';
import { deleteComment, getAllCommentsByIdeaId, getReplyComments, updateComment } from 'pages/api/comment';
import {
	addCommentReactionToComment,
	getCommentReactionStateOfUserInComment,
	removeCommentReactionFromComment,
} from 'pages/api/comment_reaction';
import { getAccountByAccountId } from 'pages/api/user';
import { IAccountData, ICommentData, ICommentReactionData, ICommentsProps } from 'lib/interfaces';

type ReplyCommentCardProps = {
	comment: ICommentData['comment'];
	loadCommentData: (comments: ICommentsProps) => void;
	currentUser: IUserData;
	isFinalClosureExpired?: boolean;
};

export const ReplyCommentCard = ({
	comment,
	loadCommentData,
	currentUser,
	isFinalClosureExpired,
}: ReplyCommentCardProps) => {
	const [replyCommentsList, setReplyCommentsList] = useState<ICommentsProps>();
	const [showReply, setShowReply] = useState(false);
	const [commentContent, setCommentContent] = useState(comment.comment_content);
	const [changeToCommentEditor, setChangeToCommentEditor] = useState(false);
	const [hasDataChanged, setHasDataChanged] = useState(false);
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const [showReplyEditor, setShowReplyEditor] = useState(false);
	const [commentReactionState, setCommentReactionState] = useState<ICommentReactionData['comment_reaction']>();

	const handleCloseMoreMenu = () => {
		setShowMoreMenu(false);
	};
	const handleShowMoreMenu = () => {
		setShowMoreMenu(!showMoreMenu);
	};

	const handleChangeToCommentEditor = () => {
		setChangeToCommentEditor(true);
	};

	const handleCloseCommentEditor = () => {
		setChangeToCommentEditor(false);
	};

	const handleShowReplyEditor = () => {
		setShowReplyEditor(!showReplyEditor);
	};
	const handleSaveEditComment = async () => {
		await updateComment(comment.comment_id, commentContent);
		setChangeToCommentEditor(false);
	};

	const handleCloseReplyEditor = () => {
		setShowReplyEditor(false);
	};

	const handleLikeComment = async () => {
		if (commentReactionState?.comment_reaction_type === 'like') {
			const { newCommentReactionState } = await removeCommentReactionFromComment(
				comment.comment_id,
				currentUser.id,
				'like'
			);
			setCommentReactionState(newCommentReactionState);
		} else {
			const { newCommentReactionState } = await addCommentReactionToComment(comment.comment_id, currentUser.id, 'like');
			setCommentReactionState(newCommentReactionState);
		}
		const data = await getAllCommentsByIdeaId(comment.idea_id, 'comment_created', false);
		loadCommentData(data as unknown as ICommentsProps);
	};

	const handleDeleteComment = async () => {
		await deleteComment(comment.comment_id);
		const data = await getAllCommentsByIdeaId(comment.idea_id, 'comment_created', false);
		loadCommentData(data as unknown as ICommentsProps);
	};

	const [user, setUser] = useState<IAccountData['account']>();
	const [avatarUrl, setAvatarUrl] = useState('');

	useEffect(() => {
		const getAdditionalData = async () => {
			const { userData } = await getAccountByAccountId(comment.account_id);
			setAvatarUrl(userData?.avatar_url as string);
			setUser(userData);

			const { commentReactionState } = await getCommentReactionStateOfUserInComment(currentUser.id, comment.comment_id);
			setCommentReactionState(commentReactionState);
		};

		void getAdditionalData();

		const getReplyCommentData = async () => {
			const { replyCommentsList } = await getReplyComments(comment?.comment_id);

			replyCommentsList ? setReplyCommentsList(replyCommentsList) : setReplyCommentsList(null!);
		};

		void getReplyCommentData();

		commentContent !== comment.comment_content ? setHasDataChanged(true) : setHasDataChanged(false);
	}, [comment, currentUser, commentContent, hasDataChanged]);
	return (
		<>
			{avatarUrl && user ? (
				<div className="flex flex-col comment-reply-card">
					<div className="flex flex-row justify-between items-center ">
						<Link href={`/user/${user?.username}`} passHref>
							<a target={'_blank'} className={`${comment.anonymous_posting ? 'disabled-link' : ''}`}>
								<div className="flex gap-2 flex-row items-center">
									{avatarUrl && !comment.anonymous_posting ? (
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
										<p className="font-semi-bold">
											{!comment.anonymous_posting ? user?.account_full_name : 'Anonymous'}
										</p>
										{!comment.anonymous_posting && (
											<p className="text-footer text-sonic-silver font-semi-bold">@{user?.username}</p>
										)}
									</div>
									<p className="text-footer font-light">{moment(comment.comment_created).fromNow()} </p>
								</div>
							</a>
						</Link>
						{comment.account_id === currentUser.id && (
							<Button onClick={handleShowMoreMenu} className="relative more-option" icon>
								<Icon size="24" name="MoreHorizontal" />
								{showMoreMenu && (
									<MoreMenu onCancel={handleCloseMoreMenu}>
										<div className="flex flex-col gap 2 items-start">
											<Button onClick={handleChangeToCommentEditor} className="btn-menu">
												Edit comment
											</Button>
											<Button onClick={handleDeleteComment} className="btn-menu">
												Delete comment
											</Button>
										</div>
									</MoreMenu>
								)}
							</Button>
						)}
					</div>
					<div className="comment-content">
						{changeToCommentEditor ? (
							<RichTextEditor
								handleEditorChange={(data: string) => setCommentContent(data)}
								className={'comment-editor'}
								value={commentContent}
								readOnly={false}
							/>
						) : (
							<RichTextEditor className={'disabled-editor'} value={commentContent} readOnly={true} />
						)}
						{changeToCommentEditor ? (
							<div className="flex justify-end gap-2 mb-6">
								<Button onClick={handleCloseCommentEditor} className="btn-secondary h-[48px]">
									Cancel
								</Button>
								<Button
									icon
									disabled={!hasDataChanged}
									onClick={handleSaveEditComment}
									className={`${hasDataChanged ? 'btn-primary' : 'btn-disabled'}  h-[48px]`}
								>
									<Icon size="16" name="Check" />
									Save
								</Button>
							</div>
						) : (
							<div className={`${replyCommentsList ? '' : 'mb-6'} comment-reaction`}>
								<Button
									type="button"
									onClick={handleLikeComment}
									icon
									className={`${
										commentReactionState?.comment_reaction_type === 'like' ? 'btn-reaction__enabled' : ''
									}  btn-secondary btn-reaction`}
								>
									<Icon name="ThumbsUp" size="16" />
									<p>
										{
											(comment.comments_reaction as unknown as []).filter(
												(comment_reaction: ICommentReactionData['comment_reaction']) =>
													comment_reaction.comment_reaction_type === 'like'
											).length
										}
									</p>
								</Button>
								<Button
									icon
									disabled={isFinalClosureExpired}
									className={`${isFinalClosureExpired ? 'btn-disabled' : 'btn-secondary'} btn-reaction`}
									onClick={handleShowReplyEditor}
								>
									<Icon name="MessageSquare" size="16" />
									{replyCommentsList ? (
										<p>
											{(replyCommentsList as unknown as []).length > 1
												? `${(replyCommentsList as unknown as []).length} replies`
												: `${(replyCommentsList as unknown as []).length} reply`}
										</p>
									) : (
										<p>0 reply</p>
									)}
								</Button>
							</div>
						)}
						{replyCommentsList && (replyCommentsList as unknown as []).length > 0 && (
							<>
								<Button
									className={`${showReply ? '' : 'mb-6'} btn__show-reply`}
									onClick={() => setShowReply(!showReply)}
								>
									{showReply ? `Hide replies` : `Show replies`}
								</Button>
								{(replyCommentsList as unknown as []).map((comment: ICommentData['comment']) => (
									<div key={comment.comment_id}>
										{showReply && (
											<ReplyCommentCard
												isFinalClosureExpired={isFinalClosureExpired}
												currentUser={currentUser}
												loadCommentData={loadCommentData}
												key={comment.comment_id}
												comment={comment}
											/>
										)}
									</div>
								))}
							</>
						)}
						{showReplyEditor && (
							<ReplyCommentEditor
								setShowReply={setShowReply}
								handleCloseReplyEditor={handleCloseReplyEditor}
								loadCommentData={loadCommentData}
								parent_comment={comment}
								user={currentUser}
								initialValue={`@${user?.username}`}
							/>
						)}
					</div>
				</div>
			) : (
				<div className="reply-comment-loader">
					<ClipLoader />
				</div>
			)}
		</>
	);
};
