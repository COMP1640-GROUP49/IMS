import Image from 'next/image';

type LogoProps = {
	width: string;
	height: string;
	className?: string;
};

export const Logo = ({ width, height, className }: LogoProps) => {
	return <Image className={className} priority src="/icon-logo.svg" width={width} height={height} alt="img-logo" />;
};
