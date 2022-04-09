import moment from 'moment';
import { useEffect, useState } from 'react';
import AttachmentUploader from 'components/AttachmentUploader';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { CommentList } from 'components/Comment';
import { Icon } from 'components/Icon';
import RichTextEditor from 'components/RichTextEditor';
import { getAccountByAccountId } from 'pages/api/user';
import { IAccountData, IIdeaData, IReactionData } from 'lib/interfaces';

const IdeaDetail = ({ idea }: IIdeaData) => {
	console.log('🚀 ~ file: index.tsx ~ line 13 ~ IdeaDetail ~ idea', idea);
	const [avatarUrl, setAvatarUrl] = useState('');
	const [user, setUser] = useState<IAccountData>();
	useEffect(() => {
		const getAdditionalInfo = async () => {
			const { userData } = await getAccountByAccountId(idea.account_id);
			setAvatarUrl(userData?.avatar_url as string);
			setUser(userData);
		};

		void getAdditionalInfo();
	}, [idea]);
	console.log('🚀 ~ file: index.tsx ~ line 10 ~ IdeaDetail ~ username', user);
	return (
		<>
			<div className="flex flex-col gap-6 justify-between card-info">
				<div className="flex justify-between gap-2 items-center">
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
				<div className="self-stretch">
					<RichTextEditor value={idea?.idea_content} readOnly={true} placeholder={`Input idea's content`} />
				</div>
				<div className="form-field self-start sm:self-stretch">
					<AttachmentUploader idea_title={idea.idea_title} account_id={idea.account_id} value={idea?.idea_file_url} />
				</div>
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
						className={` btn-secondary md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2 h-12`}
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
			</div>
			<hr className=" m-5 text-black" />
			<CommentList idea={idea} />
		</>
	);
};
export default IdeaDetail;
