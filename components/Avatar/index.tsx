import Image from 'next/image';

type AvatarProps = {
	src: string;
	size?: string;
	alt?: string;
	className?: string;
};

export const Avatar = ({ src, size, alt, className }: AvatarProps) => {
	return <Image className={`${className as string}`} src={src} width={size} height={size} alt={alt} />;
};
