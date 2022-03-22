import React from 'react';

type AvatarUploaderProps = {
	size: string;
	fileUpdate: (data: File) => void;
	value?: string;
};

const AvatarUploader = ({ size, fileUpdate, value }: AvatarUploaderProps) => {
	setTimeout(() => {
		if (typeof document !== 'undefined') {
			const avatarUploaderEl = document.getElementsByClassName('avatar-uploader')[0] as HTMLElement;
			if (avatarUploaderEl && value) {
				avatarUploaderEl.style.backgroundImage = `url('${value}')`;
				avatarUploaderEl.style.backgroundSize = 'cover';
			}
		}
	}, 1);

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
			}
		} else {
			null;
		}
	};

	return (
		<input
			name="avatar_url"
			className="avatar-uploader"
			style={{ width: `${size}px`, height: `${size}px` }}
			type="file"
			accept="image/gif, image/jpeg, image/png"
			onChange={handleChangeAvatar}
		></input>
	);
};

export default AvatarUploader;
