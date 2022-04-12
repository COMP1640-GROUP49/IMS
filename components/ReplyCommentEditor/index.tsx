/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import moment from 'moment';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { Checkbox } from 'components/Checkbox';
import { Icon } from 'components/Icon';
import RichTextEditor from 'components/RichTextEditor';
import { IUserData } from 'pages/api/auth';
import { createNewComment, getAllCommentsByIdeaId } from 'pages/api/comment';
import { ICommentData, ICommentsProps } from 'lib/interfaces';

type ReplyCommentProps = {
	parent_comment?: ICommentData['comment'];
	user: IUserData;
	loadCommentData: (comments: ICommentsProps) => void;
	handleCloseReplyEditor: () => void;
	initialValue?: string;
};

export const ReplyCommentEditor = ({
	parent_comment,
	user,
	loadCommentData,
	handleCloseReplyEditor,
	initialValue,
}: ReplyCommentProps) => {
	interface IFormValidation {
		commentValidation: string;
	}

	const [formData, setFormData] = useState({
		comment_content: `${initialValue as string} <p></p>`,
		comment_file_url: null!,
		comment_created: moment().format(),
		comment_updated: moment().format(),
		account_id: user.id,
		idea_id: parent_comment?.idea_id as string,
		parent_comment_id: parent_comment?.parent_comment_id as string,
		anonymous_posting: false,
	});

	const [formValidation, setFormValidation] = useState<IFormValidation>();

	const [isFormValidated, setIsFormValidated] = useState(false);

	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[event.target.name]: event.target.value,
		});

		if (event.target.name === 'anonymous_posting') {
			setFormData({
				...formData,
				anonymous_posting: (event.target as HTMLInputElement).checked,
			});
		}
	};

	const handleEditorChange = (data: string) => {
		setFormData({
			...formData,
			comment_content: data,
			account_id: user.id,
			idea_id: parent_comment?.idea_id as string,
			anonymous_posting: formData?.anonymous_posting || false,
			parent_comment_id: parent_comment?.comment_id as string,
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

	const handleCreateNewCommentReply = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		formData.comment_updated = moment().format();
		formData.comment_created = moment().format();

		if (isFormValidated) {
			try {
				await createNewComment(formData as unknown as ICommentData['comment']);
				formData.comment_content = '';
				handleCloseReplyEditor();
				const data = await getAllCommentsByIdeaId(
					(parent_comment as ICommentData['comment']).idea_id,
					'comment_created',
					true
				);
				loadCommentData(data);
				// Reset comment input
			} catch (error) {
				throw error;
			}
		}
	};

	useEffect(() => {
		if (formValidation?.commentValidation === 'success') {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
	}, [formData, formValidation]);
	return (
		<div className="flex flex-col gap-6 comment-reply-input">
			<form onSubmit={handleCreateNewCommentReply}>
				<div className="flex flex-col gap-4">
					<div className="form-field">
						<RichTextEditor
							value={formData?.comment_content}
							handleEditorChange={handleEditorChange}
							placeholder={`What are your thoughts?`}
						/>
					</div>
					<div className="flex gap-4 sm:flex-col md:justify-between">
						<div className="flex flex-row justify-between">
							<Checkbox
								onChange={handleChange}
								name="anonymous_posting"
								className="anonymous-posting self-start sm:self-stretch h-[48px]"
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
								className={`${isFormValidated ? `btn-primary` : 'btn-disabled'} sm:h-[48px]`}
							>
								<Icon name="Send" size="16" />
								Post
							</Button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};
