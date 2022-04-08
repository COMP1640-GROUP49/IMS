import React, { useState } from 'react';
import { formatBytes } from 'utils/formatBytes';

type AttachmentUploaderProps = {
	fileUpdate: (data: File) => void;
	value?: string;
};

const AttachmentUploader = ({ fileUpdate, value }: AttachmentUploaderProps) => {
	const [uploadTimes, setUploadTimes] = useState(0);

	setTimeout(() => {
		if (typeof document !== 'undefined') {
			const avatarUploaderEl = document.getElementsByClassName('attachment-uploader')[0] as HTMLElement;
			if (avatarUploaderEl && value) {
				avatarUploaderEl.style.backgroundImage = `url('${value}')`;
				avatarUploaderEl.style.backgroundSize = 'cover';
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
						removeFileButtonElement;
						attachmentInputElement.parentNode.replaceChild(
							removeFileButtonElement,
							attachmentInputElement.parentNode.childNodes[2]
						);
					}
				} else {
					event.target.parentNode?.appendChild(fileInfoElement);
					event.target.parentNode?.appendChild(removeFileButtonElement);
				}

				removeFileButtonElement.onclick = (event: any) => {
					(event as React.FormEvent).preventDefault();
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
			null;
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
