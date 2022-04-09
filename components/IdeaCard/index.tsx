/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { convert } from 'html-to-text';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { EditIdeaModal } from 'components/Form/form';
import { Icon } from 'components/Icon';
import Modal from 'components/Modal';
import { getCategoryById } from 'pages/api/category';
import { deleteIdea } from 'pages/api/idea';
import { getTopicIdByCategoryId } from 'pages/api/topic';
import { getAccountByAccountId } from 'pages/api/user';
import { IIdeaData, IReactionData } from 'lib/interfaces';

export const IdeaCard = ({ idea }: IIdeaData) => {
	const [showEditIdeaModal, setShowEditIdeaModal] = useState(false);

	const [avatarUrl, setAvatarUrl] = useState('');
	const [username, setUsername] = useState('');
	const [categoryName, setCategoryName] = useState('');
	const [topicId, setTopicId] = useState('');

	const router = useRouter();
	const { asPath } = useRouter();

	const handleShowEditIdeaModal = useCallback(() => {
		setShowEditIdeaModal(!showEditIdeaModal);
	}, [showEditIdeaModal]);

	const handleCloseEditIdeaModal = useCallback(() => {
		setShowEditIdeaModal(false);
	}, []);

	const [showDeleteIdeaModal, setShowDeleteIdeaModal] = useState(false);
	const handleShowDeleteIdeaModal = useCallback(() => {
		// setShowConfirmIdeaModal(false);
		setShowDeleteIdeaModal(!showDeleteIdeaModal);
	}, [showDeleteIdeaModal]);

	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteIdeaModal(false);
	}, []);

	// const [showConfirmIdeaModal, setShowConfirmIdeaModal] = useState(false);
	// const handleConfirmModal = useCallback(() => {
	// 	setShowConfirmIdeaModal(!showConfirmIdeaModal);
	// }, [showConfirmIdeaModal]);

	// const handleCloseConfirmModal = useCallback(() => {
	// 	setShowConfirmIdeaModal(false);
	// 	setShowDeleteIdeaModal(false);
	// }, []);
	const handleDeleteIdeaModal = async () => {
		await deleteIdea(idea.idea_id, idea.idea_title);
		router.reload();
	};

	useEffect(() => {
		const getAdditionalInfo = async () => {
			const { userData } = await getAccountByAccountId(idea.account_id);
			setAvatarUrl(userData?.avatar_url as string);
			setUsername(userData?.username as string);

			const { categoryData } = await getCategoryById(idea.category_id);
			setCategoryName(categoryData?.category_name as string);

			const { topicId } = await getTopicIdByCategoryId(idea.category_id);
			setTopicId(topicId);
		};

		void getAdditionalInfo();
	}, [idea]);

	return (
		<tr className="idea-card">
			<div className="idea-card__info-wrapper">
				<Link href={`${asPath}/${idea.idea_id}`} passHref>
					<a>
						<div className="idea-card__info">
							<td>
								<p className="text-subtitle font-semi-bold">{idea.idea_title}</p>
							</td>
							<td>
								<span className="flex items-center gap-1 card-info">
									<Icon size="16" name="Hash" />
									<p>{`${categoryName}`}</p>
								</span>
							</td>
							<div className="lg:flex lg:flex-row lg:gap-6 flex flex-col gap-2">
								<td>
									<span className="flex items-center gap-1 card-info">
										<Icon size="16" name="Eye" />
										<p>{idea.idea_view > 1 ? `${idea.idea_view} views` : `${idea.idea_view} view`}</p>
									</span>
								</td>
								<div className="flex gap-2 lg:gap-6">
									<td>
										<span className="flex items-center gap-1 card-info">
											<Icon size="16" name="ThumbsUp" />
											<p>
												{
													(idea.reaction as unknown as []).filter(
														(reaction: IReactionData['reaction']) => reaction.reaction_type === 'like'
													).length
												}
											</p>
										</span>
									</td>
									<td>
										<span className="flex items-center gap-1 card-info">
											<Icon size="16" name="ThumbsDown" />
											<p>
												{
													(idea.reaction as unknown as []).filter(
														(reaction: IReactionData['reaction']) => reaction.reaction_type === 'dislike'
													).length
												}
											</p>
										</span>
									</td>
								</div>
								<td>
									<span className="flex items-center gap-1 card-info">
										<Icon size="16" name="MessageSquare" />
										<p>
											{(idea.comments as unknown as []).length > 1
												? `${(idea.comments as unknown as []).length} comments`
												: `${(idea.comments as unknown as []).length} comment`}
										</p>
									</span>
								</td>
							</div>

							<td>
								<span className="flex items-center gap-1 card-info">
									<Icon size="16" name="File" />
									<p className={!idea.idea_content ? 'italic' : 'idea-content'}>
										{convert(idea.idea_content, { wordwrap: 50, whitespaceCharacters: '\t\r\n\f\u200b' }) || `Blank`}
									</p>
								</span>
							</td>
							<div className="lg:flex lg:flex-row lg:gap-6 flex flex-col gap-2">
								{idea.idea_file_url !== '' && idea.idea_file_url !== null && (
									<td>
										<span className="flex items-center gap-1 card-info">
											<Icon size="16" name="Download" />
											<p>File attached</p>
										</span>
									</td>
								)}
								<td>
									<div className="flex gap-1 items-center card-info">
										{avatarUrl && !idea.anonymous_posting ? (
											<Avatar src={`${avatarUrl}`} size="16" className="rounded-full" alt={`{}'s avatar`} />
										) : (
											<Avatar src={'/default-avatar.png'} size="16" className="rounded-full" alt={`{}'s avatar`} />
										)}
										{/* TODO: Link to user's profile page */}
										<p>
											Submitted by{' '}
											<span className="inline font-semi-bold text-black">
												{!idea.anonymous_posting ? `@${username}` : `anonymous`}
											</span>
										</p>
									</div>
								</td>
							</div>
							<div className="lg:flex lg:flex-row lg:gap-6 flex flex-col gap-2">
								<td>
									<span className="flex items-center gap-1 card-info">
										<Icon size="16" name="Clock" />
										<p>Submitted {moment(idea.idea_created).fromNow()} </p>
									</span>
								</td>
								<td>
									<span className="flex items-center gap-1 card-info">
										<Icon size="16" name="Check" />
										<p>Last edited {moment(idea.idea_updated).fromNow()} </p>
									</span>
								</td>
							</div>
						</div>
					</a>
				</Link>
				<div className="idea-card__action">
					<td>
						<div className="flex flex-1 justify-between lg:justify-start lg:gap-4">
							<Button onClick={handleShowEditIdeaModal} icon className="btn-secondary">
								<Icon name="Edit" size="16" />
								Edit
							</Button>
							{showEditIdeaModal && (
								<Modal onCancel={handleCloseEditIdeaModal} headerText={`Edit ${idea.idea_title}`}>
									<EditIdeaModal topic_id={topicId} ideaData={idea} />
								</Modal>
							)}

							<Button onClick={handleShowDeleteIdeaModal} icon className="btn-primary">
								<Icon name="Trash" size="16" />
								Delete
							</Button>

							{showDeleteIdeaModal && (
								<Modal onCancel={handleCloseDeleteModal}>
									<div className="flex flex-col gap-6 justify-center">
										<p>
											Are you sure you want to delete this <span className="font-semi-bold">{idea.idea_title}</span>?
										</p>
										<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
											{/*TODO: Edit delete button box-shadow*/}
											<Button onClick={handleDeleteIdeaModal} className="btn-danger w-full">
												Delete it
											</Button>
											{/* showConfirmIdeaModal && (
												<Modal onCancel={handleCloseConfirmModal}>
													<div className="flex flex-col gap-6 justify-center">
														<p>
															Please remove all ideas inside <span className="font-semi-bold">{idea.idea_title}</span>{' '}
															before deleting it!
														</p>
														<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
															<Button onClick={handleCloseConfirmModal} className="btn-success w-full">
																Ok, got it!{' '}
															</Button>
														</div>
													</div>
												</Modal>
											) */}
											<Button onClick={handleCloseDeleteModal} className="btn-secondary  w-full">
												Cancel
											</Button>
										</div>
									</div>
								</Modal>
							)}
						</div>
					</td>
				</div>
			</div>
		</tr>
	);
};
