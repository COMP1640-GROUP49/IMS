/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState } from 'react';
import { zipAndDownloadFile } from 'pages/api/idea';
import { formatBytes } from 'utils/formatBytes';
import { getFileSizeFromUrl } from 'utils/getFileSizeFromUrl';

type AttachmentProps = {
	fileUpdate?: (data: File) => void;
	value?: string;
	idea_title?: string;
	account_id?: string;
	moreOptions?: {
		department_name: string;
		topic_id: string;
	};
};

const Attachment = ({ value, idea_title, account_id, moreOptions }: AttachmentProps) => {
	const [loadAttachment, setLoadAttachment] = useState(value);
	const [fileSize, setFileSize] = useState(0);

	setTimeout(() => {
		if (typeof document !== 'undefined') {
			const attachmentUploaderEl = document.getElementsByClassName('attachment')[0] as HTMLElement;
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

				if (typeof document !== 'undefined') {
					const fileInfoElement = document.createElement('div');
					fileInfoElement.innerHTML = fileInfoElementHtml;
					fileInfoElement.classList.add('file-info');

					const fileInfoEl = document.getElementsByClassName('file-info')[0] as HTMLElement;
					if (!fileInfoEl && fileSize > 0) {
						attachmentUploaderEl.parentNode?.appendChild(fileInfoElement);
					}
				}
			}
		}
	}, 1);

	const handleDownloadFile = async () => {
		await zipAndDownloadFile(value as string, idea_title as string, account_id as string);
	};

	return (
		<div className={`relative attachment-wrapper`}>
			<input
				name="idea_file_url"
				disabled={true}
				className="attachment"
				type="file"
				accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
                text/plain, application/pdf"
			/>
			<button className="absolute-btn-download" onClick={handleDownloadFile} />
		</div>
	);
};

export default Attachment;
