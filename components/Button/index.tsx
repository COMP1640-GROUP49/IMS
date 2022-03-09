type ButtonProps = {
	children: React.ReactNode;
	icon?: boolean;
	className?: string;
	onClick?: (event: React.FormEvent) => void | undefined;
};

export const Button = ({ icon, children, className, onClick }: ButtonProps) => {
	return icon ? (
		<button className={`flex items-center justify-center gap-4 ${className!}`}>{children}</button>
	) : (
		<button onClick={onClick} className={`${className!}`}>
			{children}
		</button>
	);
};
