import moment from 'moment';
import { useEffect, useState } from 'react';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { CommentForm } from 'components/Form/form';
import { Icon } from 'components/Icon';
import { getCommentById } from 'pages/api/comment';
import { getAccountByAccountId } from 'pages/api/user';
import { IAccountData, ICommentData, IIdeaData, IReactionData } from 'lib/interfaces';

export const CommentList = ({ idea }: IIdeaData) => {
	console.log('🚀 ~ file: index.tsx ~ line 4 ~ CommentList ~ idea', idea);
	const [comment, setComment] = useState<ICommentData>();
	const [user, setUser] = useState<IAccountData>();
	const [avatarUrl, setAvatarUrl] = useState('');

	useEffect(() => {
		const getComment = async () => {
			const { commentData } = await getCommentById(idea.idea_id);
			setComment(commentData);
			const { userData } = await getAccountByAccountId(idea.account_id);
			setAvatarUrl(userData?.avatar_url as string);
			setUser(userData);
		};

		void getComment();
	}, []);
	return (
		<>
			<div className="flex flex-col gap-6">
				<div className="flex justify-between items-center">
					<div className="flex gap-2 flex-row items-center">
						{avatarUrl && !idea.anonymous_posting ? (
							<Avatar src={`${avatarUrl}`} size="48" className="rounded-full" alt={`{}'s avatar`} />
						) : (
							<Avatar src={'/default-avatar.png'} size="48" className="rounded-full" alt={`{}'s avatar`} />
						)}
						<div>
							<h1 className="text-base text-black">{user?.account_full_name}</h1>
							<p>@{user?.username}</p>
						</div>
					</div>
					<div>
						<p>{moment(idea.idea_created).fromNow()} </p>
					</div>
				</div>
				<h1 className="text-base font-normal">{comment?.comment_content}</h1>
				<div className="flex gap-3 self-start sm:self-stretch">
					<Button
						type="button"
						icon={true}
						className={` btn-secondary md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2 h-12`}
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
						type="button"
						icon={true}
						className={`btn-secondary md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2 h-12`}
					>
						<Icon name="MessageSquare" size="16" />
						<p>
							{(idea.comments as unknown as []).length > 1
								? `${(idea.comments as unknown as []).length} comments`
								: `${(idea.comments as unknown as []).length} comment`}
						</p>
					</Button>
				</div>
				<hr className=" m-5 text-black" />
				<CommentForm ideData={idea} />
			</div>
		</>
	);
};
