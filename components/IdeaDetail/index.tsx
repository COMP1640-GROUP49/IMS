/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import Attachment from 'components/Attachment';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { CommentInput } from 'components/CommentInput';
import { CommentList } from 'components/CommentList';
import { Icon } from 'components/Icon';
import { UserContext } from 'components/PrivateRoute';
import RichTextEditor from 'components/RichTextEditor';
import { getDepartmentNameFromTopicId } from 'pages/api/department';
import { getIdeaById, increaseViewCountBy1 } from 'pages/api/idea';
import { addReactionToIdea, getReactionStateOfUserInIdea, removeReactionFromIdea } from 'pages/api/reaction';
import { getTopicIdByCategoryId } from 'pages/api/topic';
import { getAccountByAccountId } from 'pages/api/user';
import { IAccountData, ICommentsProps, IIdeaData, IReactionData } from 'lib/interfaces';

const IdeaDetail = ({ idea: ideaData }: IIdeaData) => {
	console.log('🚀 ~ file: index.tsx ~ line 21 ~ IdeaDetail ~ ideaData', ideaData);
	const [idea, setIdea] = useState<IIdeaData['idea']>(ideaData);
	const [avatarUrl, setAvatarUrl] = useState('');
	const [user, setUser] = useState<IAccountData['account']>();
	const [reactionState, setReactionState] = useState<IReactionData['reaction']>();
	const currentUser = useContext(UserContext);

	const [departmentName, setDepartmentName] = useState('');
	const [topicId, setTopicId] = useState('');

	const loadCommentData = (comments: ICommentsProps) => {
		setIdea({
			...ideaData,
			comments_list: comments,
		});
	};

	const reloadIdeaData = async () => {
		const { ideaData } = await getIdeaById(idea.idea_id, 'comment_created', false);
		setIdea(ideaData as unknown as IIdeaData['idea']);
	};

	const handleLikeIdea = async () => {
		if (reactionState?.reaction_type === 'like') {
			const { newReactionState: removeLike } = await removeReactionFromIdea(
				idea.idea_id,
				currentUser.id,
				'like',
				idea.popular_point
			);
			setReactionState(removeLike);
		} else {
			if (reactionState?.reaction_type === 'dislike') {
				const { newReactionState: removeDislike } = await removeReactionFromIdea(
					idea.idea_id,
					currentUser.id,
					'dislike',
					idea.popular_point
				);
				const { newReactionState: addLike } = await addReactionToIdea(
					idea.idea_id,
					currentUser.id,
					'like',
					++idea.popular_point!
				);
				setReactionState(addLike);
			} else {
				const { newReactionState: addLike } = await addReactionToIdea(
					idea.idea_id,
					currentUser.id,
					'like',
					idea.popular_point
				);
				setReactionState(addLike);
			}
		}
		void reloadIdeaData();
	};

	const handleDislikeIdea = async () => {
		if (reactionState?.reaction_type === 'dislike') {
			const { newReactionState: removeDislike } = await removeReactionFromIdea(
				idea.idea_id,
				currentUser.id,
				'dislike',
				idea.popular_point
			);
			setReactionState(removeDislike);
		} else {
			if (reactionState?.reaction_type === 'like') {
				const { newReactionState: removeLike } = await removeReactionFromIdea(
					idea.idea_id,
					currentUser.id,
					'like',
					idea.popular_point
				);
				const { newReactionState: addDislike } = await addReactionToIdea(
					idea.idea_id,
					currentUser.id,
					'dislike',
					--idea.popular_point!
				);
				setReactionState(addDislike);
			} else {
				const { newReactionState: addDislike } = await addReactionToIdea(
					idea.idea_id,
					currentUser.id,
					'dislike',
					idea.popular_point
				);
				setReactionState(addDislike);
			}
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

		const getDepartmentNameAndTopicId = async () => {
			const { topicId } = await getTopicIdByCategoryId(idea.category_id);
			topicId && setTopicId(topicId);

			const { department_name } = await getDepartmentNameFromTopicId(topicId);
			department_name && setDepartmentName(department_name);
		};
		void getDepartmentNameAndTopicId();
	}, [idea, currentUser]);
	return (
		<>
			<div className="flex flex-col gap-6 justify-between">
				<div className="flex justify-between gap-2 items-center">
					<Link href={`/user/${user?.username as string}`} passHref>
						<a target={'_blank'} className={`${idea.anonymous_posting ? 'disabled-link' : ''}`}>
							<div className="flex gap-2 flex-row items-center user-profile-link">
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
						</a>
					</Link>

					<p className="text-footer font-light">{moment(idea.idea_created).fromNow()} </p>
				</div>
				<div className="idea-content__disabled-editor">
					<RichTextEditor
						className="disabled-editor"
						value={
							!idea?.idea_content || idea?.idea_content === '<p><br></p>' ? '<em>No content</em>' : idea?.idea_content
						}
						readOnly={true}
						placeholder={`Input idea's content`}
					/>
				</div>
				{idea?.idea_file_url && (
					<Attachment
						idea_title={idea.idea_title}
						account_id={idea.account_id}
						value={idea?.idea_file_url}
						moreOptions={{ department_name: departmentName, topic_id: topicId }}
					/>
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
								(idea.reaction_list as unknown as []).filter(
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
								(idea.reaction_list as unknown as []).filter(
									(reaction: IReactionData['reaction']) => reaction.reaction_type === 'dislike'
								).length
							}
						</p>
					</Button>
					<Button icon className={`btn-secondary btn-reaction`}>
						<Icon name="MessageSquare" size="16" />
						<p>
							{(idea.comments_list as unknown as []).length > 1
								? `${(idea.comments_list as unknown as []).length} comments`
								: `${(idea.comments_list as unknown as []).length} comment`}
						</p>
					</Button>
				</div>
			</div>
			{(idea.comments_list as unknown as []).length > 0 && <hr className="line-divider" />}
			<CommentList loadCommentData={loadCommentData} idea={idea} />
			<hr className="line-divider" />
			<CommentInput loadCommentData={loadCommentData} idea={idea} user={currentUser} />
		</>
	);
};
export default IdeaDetail;
