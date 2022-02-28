import Image from 'next/image';

type LogoProps = {
	width: string;
	height: string;
};

export const Logo = ({ width, height }: LogoProps) => {
	return <Image priority src="/icon-logo.svg" width={width} height={height} alt="img-logo" />;
};
