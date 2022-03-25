import Link from 'next/link';
import { Icon } from 'components/Icon';
type Props = {
	link?: string;
	title: string;
	children: React.ReactNode;
};

export const LinkComponent = ({ link, title, children }: Props) => {
	return (
		<Link href={link!} passHref>
			<a className="link-component">
				<div className="mr-3 lg:mr-0 profile-menu__prefix-icon-lg">{children}</div>
				<div className="mr-auto lg:mr-0 profile-menu__text-lg">
					<p>{title}</p>
				</div>
				<Icon className="ml-6" color="#717171" name="ChevronRight" size="32" />
			</a>
		</Link>
	);
};
