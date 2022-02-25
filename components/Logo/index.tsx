import Image from 'next/image';

type LogoProps = {
	width: string;
	height: string;
};

export const Logo = ({ width, height }: LogoProps) => {
	return <Image src="/icon-logo.svg" width={width} height={height} alt="img-logo" />;
};
