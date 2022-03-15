import Image from 'next/image';

type AvatarProps = {
	src: string;
	size?: string;
	alt?: string;
	className?: string;
};

export const Avatar = ({ src, size, alt, className }: AvatarProps) => {
	return (
		<div className={`${className as string}`} style={{ width: `${size as string}px`, height: `${size as string}px` }}>
			<Image
				className={`${className as string} avatar`}
				src={src}
				layout="responsive"
				width={size}
				height={size}
				alt={alt}
				priority
			/>
		</div>
	);
};
