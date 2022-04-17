/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import AttachmentUploader from 'components/AttachmentUploader';
import { Button } from 'components/Button';
import { Checkbox } from 'components/Checkbox';
import { Icon } from 'components/Icon';
import RichTextEditor from 'components/RichTextEditor';
import { IUserData } from 'pages/api/auth';
import { createNewComment, getAllCommentsByIdeaId } from 'pages/api/comment';
import { sendEmailToIdeaAuthor } from 'pages/api/email';
import { getTopicById, getTopicIdByCategoryId } from 'pages/api/topic';
import { getAccountByAccountId } from 'pages/api/user';
import { IAccountData, ICommentData, ICommentsProps, IIdeaData, ITopicData } from 'lib/interfaces';

type CommentInputProps = {
	idea: IIdeaData['idea'];
	user: IUserData;
	loadCommentData: (comments: ICommentsProps) => void;
};

export const CommentInput = ({ idea, user, loadCommentData }: CommentInputProps) => {
	const router = useRouter();
	const [formData, setFormData] = useState<ICommentData['comment']>();
	const [formAutomaticEmail, setFormAutomaticEmail] = useState({
		idea_title: idea.idea_title,
		author_username: '',
		username: '',
		comment_content: formData?.comment_content,
		idea_link: typeof window !== 'undefined' && window.location.href,
		to_email: '',
	});

	const [formValidation, setFormValidation] = useState<IFormValidation>();

	const [isFormValidated, setIsFormValidated] = useState(false);

	const [isFinalClosureExpired, setIsFinalClosureExpired] = useState(false);

	interface IFormValidation {
		commentValidation: string;
	}

	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setFormData({
			...(formData as ICommentData['comment']),
			[event.target.name]: event.target.value,
		});

		if (event.target.name === 'anonymous_posting') {
			setFormData({
				...(formData as ICommentData['comment']),
				anonymous_posting: (event.target as HTMLInputElement).checked,
			});
			setFormAutomaticEmail({
				...formAutomaticEmail,
				username: (event.target as HTMLInputElement).checked
					? 'An anonymous user'
					: (user.user_metadata as IAccountData['account']).username,
			});
		}
	};

	const handleEditorChange = (data: string) => {
		setFormData({
			...(formData as ICommentData['comment']),
			comment_content: data,
			account_id: user.id,
			idea_id: idea.idea_id,
			anonymous_posting: formData?.anonymous_posting || false,
		});

		setFormAutomaticEmail({
			...formAutomaticEmail,
			username: !formData?.anonymous_posting
				? `@${(user.user_metadata as IAccountData['account']).username}`
				: 'An anonymous user',
			comment_content: data,
		});

		if (data !== '') {
			if (data === '<p><br></p>') {
				setFormValidation({
					...formValidation!,
					commentValidation: 'error',
				});
			} else {
				setFormValidation({
					...formValidation!,
					commentValidation: 'success',
				});
			}
		} else {
			setFormValidation({
				...formValidation!,
				commentValidation: 'error',
			});
		}
	};

	const handleCreateNewComment = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();

		if (isFormValidated) {
			try {
				await createNewComment(formData as ICommentData['comment']);
				formData!.comment_content = '';
				const data = await getAllCommentsByIdeaId(idea.idea_id, 'comment_created', true);
				if (user.id !== idea.account_id) {
					if (typeof document !== 'undefined') {
						const hiddenForm = document.getElementById('hidden-form');
						await sendEmailToIdeaAuthor(hiddenForm as HTMLFormElement);
					}
				}
				loadCommentData(data);
				// Reset comment input
			} catch (error) {
				throw error;
			}
		}
	};

	// const handleSendAutomaticEmail = () => {

	// }

	useEffect(() => {
		const getAdditionalInfo = async () => {
			const { topicId } = await getTopicIdByCategoryId(idea.category_id);
			const { data } = await getTopicById(topicId);
			setIsFinalClosureExpired(
				moment((data as unknown as ITopicData['topic']).topic_final_closure_date).isBefore(moment.now())
			);

			const { userData: author } = await getAccountByAccountId(idea.account_id);
			const { userData: currentUser } = await getAccountByAccountId(user.id);
			setFormAutomaticEmail({
				...formAutomaticEmail,
				author_username: author.username,
				to_email: author.account_email,
			});
		};

		void getAdditionalInfo();

		if (formValidation?.commentValidation === 'success') {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
	}, [formData, formValidation, idea]);

	return (
		<>
			{!isFinalClosureExpired ? (
				<div className="flex flex-col gap-6 comment-input">
					<form id="hidden-form">
						<div className="field">
							<label htmlFor="idea_title">idea_title</label>
							<input defaultValue={formAutomaticEmail.idea_title} type="text" name="idea_title" id="idea_title"></input>
						</div>
						<div className="field">
							<label htmlFor="author_username">author_username</label>
							<input
								defaultValue={formAutomaticEmail.author_username}
								type="text"
								name="author_username"
								id="author_username"
							></input>
						</div>
						<div className="field">
							<label htmlFor="username">username</label>
							<input defaultValue={formAutomaticEmail.username} type="text" name="username" id="username"></input>
						</div>
						<div className="field">
							<label htmlFor="comment_content">comment_content</label>
							<input
								defaultValue={formAutomaticEmail.comment_content}
								type="text"
								name="comment_content"
								id="comment_content"
							></input>
						</div>
						<div className="field">
							<label htmlFor="idea_link">idea_link</label>
							<input
								defaultValue={formAutomaticEmail.idea_link as string}
								type="text"
								name="idea_link"
								id="idea_link"
							></input>
						</div>
						<div className="field">
							<label htmlFor="to_email">to_email</label>
							<input defaultValue={formAutomaticEmail.to_email} type="text" name="to_email" id="to_email"></input>
						</div>
						<div className="field">
							<label htmlFor="reply_to">reply_to</label>
							<input type="text" name="reply_to" id="reply_to"></input>
						</div>
					</form>
					<form onSubmit={handleCreateNewComment}>
						<div className="flex flex-col gap-4">
							<div className="form-field">
								<RichTextEditor
									value={formData?.comment_content as string}
									handleEditorChange={handleEditorChange}
									placeholder={`What are your thoughts?`}
								/>
							</div>
							<div className="flex gap-4 sm:flex-col md:justify-between lg:justify-between">
								<Checkbox
									onChange={handleChange}
									name="anonymous_posting"
									className="anonymous-posting self-start sm:self-stretch"
								>
									<label htmlFor="anonymous_posting">
										Post as <span className="font-semi-bold">anonymous</span>
									</label>
								</Checkbox>
								{/* TODO: Upload attachment for comment (future version) */}
								{/* <AttachmentUploader fileUpdate={fileUpdate} /> */}
								<Button
									disabled={!isFormValidated}
									icon={true}
									className={`${isFormValidated ? `btn-primary` : 'btn-disabled'} sm:w-full sm:h-[64px] h-[50px]`}
								>
									<Icon name="Send" size="16" />
									Post
								</Button>
							</div>
						</div>
					</form>
				</div>
			) : (
				<p className="text-center text-sonic-silver">
					Comments are disabled for this idea after the final closure date.
				</p>
			)}
		</>
	);
};
