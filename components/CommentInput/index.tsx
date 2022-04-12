/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import { FormEvent, useEffect, useState } from 'react';
import AttachmentUploader from 'components/AttachmentUploader';
import { Button } from 'components/Button';
import { Checkbox } from 'components/Checkbox';
import { Icon } from 'components/Icon';
import RichTextEditor from 'components/RichTextEditor';
import { IUserData } from 'pages/api/auth';
import { createNewComment, getAllCommentsByIdeaId } from 'pages/api/comment';
import { getTopicById, getTopicIdByCategoryId } from 'pages/api/topic';
import { ICommentData, ICommentsProps, IIdeaData, ITopicData } from 'lib/interfaces';

type CommentInputProps = {
	idea: IIdeaData['idea'];
	user: IUserData;
	loadCommentData: (comments: ICommentsProps) => void;
};

export const CommentInput = ({ idea, user, loadCommentData }: CommentInputProps) => {
	const [formData, setFormData] = useState<ICommentData['comment']>();

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
				loadCommentData(data);
				// Reset comment input
			} catch (error) {
				throw error;
			}
		}
	};

	useEffect(() => {
		const getAdditionalInfo = async () => {
			const { topicId } = await getTopicIdByCategoryId(idea.category_id);
			const { data } = await getTopicById(topicId);
			setIsFinalClosureExpired(
				moment((data as unknown as ITopicData['topic']).topic_final_closure_date).isBefore(moment.now())
			);
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
