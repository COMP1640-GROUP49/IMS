import React, { useEffect, useState } from 'react';
import { formatBytes } from 'utils/formatBytes';
import { getFileSizeFromUrl } from 'utils/getFileSizeFromUrl';

type AttachmentUploaderProps = {
	fileUpdate: (data: File) => void;
	value?: string;
	idea_title?: string;
	account_id?: string;
	moreOptions?: {
		department_name: string;
		topic_id: string;
	};
};

const AttachmentUploader = ({ fileUpdate, value, idea_title, account_id, moreOptions }: AttachmentUploaderProps) => {
	const [uploadTimes, setUploadTimes] = useState(0);
	const [loadAttachment, setLoadAttachment] = useState(value);
	const [fileSize, setFileSize] = useState(0);

	setTimeout(() => {
		if (typeof document !== 'undefined') {
			const attachmentUploaderEl = document.getElementsByClassName('attachment-uploader')[0] as HTMLElement;
			// Get files info from server
			if (attachmentUploaderEl && loadAttachment) {
				attachmentUploaderEl.style.backgroundColor = `#E3E3E3`;
				attachmentUploaderEl.style.backgroundImage = `none`;

				const fileName = loadAttachment
					.split('/')
					.pop()
					?.replaceAll(`${idea_title as string}_`, '')
					.replaceAll(`_${account_id as string}`, '')
					.split('?token')[0] as string;

				// REFACTOR: Can get size by calling storage-js api to get [metadata][size]
				const getFileSize = async () => {
					const data = await getFileSizeFromUrl(loadAttachment, moreOptions);
					!data && console.log('here');
					setFileSize(data as number);
				};

				void getFileSize();

				const fileInfoElementHtml = `
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#717171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            <div class="flex flex-col gap-0">
				<p class="file-name">${fileName}</p>
            	<p class="file-size">${formatBytes(fileSize)}</p>
			</div>
            `;

				const removeFileButtonHtml = `
			Remove file
			`;

				if (typeof document !== 'undefined') {
					const fileInfoElement = document.createElement('div');
					fileInfoElement.innerHTML = fileInfoElementHtml;
					fileInfoElement.classList.add('file-info');

					const removeFileButtonElement = document.createElement('button');
					removeFileButtonElement.innerHTML = removeFileButtonHtml;
					removeFileButtonElement.classList.add('btn__remove-file');

					const fileInfoEl = document.getElementsByClassName('file-info')[0] as HTMLElement;
					const btnRemoveFileEl = document.getElementsByClassName('btn__remove-file')[0] as HTMLElement;
					if (!fileInfoEl && !btnRemoveFileEl && fileSize > 0) {
						removeFileButtonElement.onclick = (event: any) => {
							(event as React.FormEvent).preventDefault();
							setUploadTimes(0);
							setLoadAttachment('');
							(attachmentUploaderEl as HTMLInputElement).value = '';
							if (attachmentUploaderEl && attachmentUploaderEl.parentNode) {
								attachmentUploaderEl.parentNode.removeChild(fileInfoElement);
								attachmentUploaderEl.parentNode.removeChild(removeFileButtonElement);
								attachmentUploaderEl.style.backgroundColor = `white`;
								attachmentUploaderEl.style.setProperty(
									'background-image',
									'url(/_next/static/media/upload.dd82e6b7.svg)',
									'important'
								);
							}
							fileUpdate(undefined!);
						};
						attachmentUploaderEl.parentNode?.appendChild(fileInfoElement);
						attachmentUploaderEl.parentNode?.appendChild(removeFileButtonElement);
					}
				}
			}
		}
	}, 1);

	const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] as Blob;

		const reader = new FileReader();
		setUploadTimes(uploadTimes + 1);

		reader.onloadend = function () {
			const attachmentInputElement = event.target;

			event.target.style.backgroundColor = `#E3E3E3`;
			event.target.style.backgroundImage = `none`;

			const fileInfoElementHtml = `
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#717171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
            <div class="flex flex-col gap-0">
				<p class="file-name">${(file as File).name}</p>
            	<p class="file-size">${formatBytes((file as File).size)}</p>
			</div>
            `;

			const removeFileButtonHtml = `
			Remove file
			`;

			if (typeof document !== 'undefined') {
				const fileInfoElement = document.createElement('div');
				fileInfoElement.innerHTML = fileInfoElementHtml;
				fileInfoElement.classList.add('file-info');

				const removeFileButtonElement = document.createElement('button');
				removeFileButtonElement.innerHTML = removeFileButtonHtml;
				removeFileButtonElement.classList.add('btn__remove-file');

				if (uploadTimes > 0) {
					if (attachmentInputElement && attachmentInputElement.parentNode) {
						// attachmentInputElement.parentNode.removeChild(attachmentInputElement.parentNode.firstChild!);
						attachmentInputElement.parentNode.replaceChild(
							fileInfoElement,
							attachmentInputElement.parentNode.childNodes[1]
						);
						attachmentInputElement.parentNode.replaceChild(
							removeFileButtonElement,
							attachmentInputElement.parentNode.childNodes[2]
						);
					}
				} else {
					if (loadAttachment !== '' && typeof loadAttachment !== 'undefined') {
						if (attachmentInputElement && attachmentInputElement.parentNode) {
							// attachmentInputElement.parentNode.removeChild(attachmentInputElement.parentNode.firstChild!);
							attachmentInputElement.parentNode.replaceChild(
								fileInfoElement,
								attachmentInputElement.parentNode.childNodes[1]
							);
							attachmentInputElement.parentNode.replaceChild(
								removeFileButtonElement,
								attachmentInputElement.parentNode.childNodes[2]
							);
							setLoadAttachment('');
						}
					} else {
						event.target.parentNode?.appendChild(fileInfoElement);
						event.target.parentNode?.appendChild(removeFileButtonElement);
					}
				}

				removeFileButtonElement.onclick = (event: any) => {
					(event as React.FormEvent).preventDefault();
					setLoadAttachment('');
					setUploadTimes(0);
					attachmentInputElement.value = '';
					if (attachmentInputElement && attachmentInputElement.parentNode) {
						attachmentInputElement.parentNode.removeChild(fileInfoElement);
						attachmentInputElement.parentNode.removeChild(removeFileButtonElement);
					}
					attachmentInputElement.style.backgroundColor = `white`;
					attachmentInputElement.style.setProperty(
						'background-image',
						'url(/_next/static/media/upload.dd82e6b7.svg)',
						'important'
					);

					fileUpdate(undefined!);
				};
			}
		};

		// Escape TypeError
		if (file) {
			reader.readAsDataURL(file);
			if (event.target.files?.[0]) {
				try {
					fileUpdate(event.target.files?.[0]);
				} catch (error) {
					console.error(error);
				}
			}
		} else {
			return false;
		}
	};

	return (
		<div className="relative attachment-uploader-wrapper">
			<input
				name="idea_file_url"
				className="attachment-uploader"
				type="file"
				accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
                text/plain, application/pdf"
				onChange={handleAttachmentChange}
			/>
		</div>
	);
};

export default AttachmentUploader;
