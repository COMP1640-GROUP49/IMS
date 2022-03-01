import Link from 'next/link';
import { Icon } from 'components/Icon';
type Props = {
	link: string;
	title: string;
	children: React.ReactNode;
};

export const LinkComponents = ({ link, title, children }: Props) => {
	return (
		<li>
			<Link href={link}>
				<a className=" flex items-center gap-x-6">
					<div className="lg:hidden">{children}</div>
					<div>
						<h1>{title}</h1>
					</div>
					<div className="lg:hidden ml-auto">
						<Icon name="ChevronRight" size="32" />
					</div>
				</a>
			</Link>
		</li>
	);
};
