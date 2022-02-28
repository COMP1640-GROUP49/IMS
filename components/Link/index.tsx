import Link from 'next/link';
import { Icon } from 'components/Icon';
type Props = {
	link: string;
	title: string;
	children: React.ReactNode;
};

export const LinkComponents = ({ link, title, children }: Props) => {
	return (
		<Link href={link}>
			<a className="hover:cursor-pointer hover:bg-white lg:hover:bg-transparent lg:text-black hover:text-slate-900 w-[90%]  rounded-l-[30px] transition-all pl-1 lg:pl-5 ease-in-out flex justify-between items-center ml-4">
				<div className="mr-3 lg:hidden">{children}</div>
				<div className="mr-auto">
					<h1>{title}</h1>
				</div>
				<div className="lg:hidden">
					<Icon name="ChevronRight" size="32" />
				</div>
			</a>
		</Link>
	);
};
