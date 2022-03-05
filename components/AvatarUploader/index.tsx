import React from 'react';

type AvatarUploaderProps = {
	size: string;
	fileUpdate: (data: File) => void;
};

const AvatarUploader = ({ size, fileUpdate }: AvatarUploaderProps) => {
	const handleChangeAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] as Blob;

		const reader = new FileReader();
		reader.onloadend = function () {
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			event.target.style.backgroundImage = `url('${reader.result}')`;
			event.target.style.backgroundSize = 'cover';
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
			} else {
			}
		} else {
			null;
		}
	};

	return (
		<input
			className="avatar-uploader"
			style={{ width: `${size}px`, height: `${size}px` }}
			type="file"
			accept="image/gif, image/jpeg, image/png"
			onChange={handleChangeAvatar}
		></input>
	);
};

export default AvatarUploader;
