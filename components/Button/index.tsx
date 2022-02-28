type ButtonProps = {
	children: React.ReactNode;
	icon?: boolean;
	className?: string;
	onClick?: (event: React.FormEvent) => void;
};

export const Button = ({ icon, children, className, onClick }: ButtonProps) => {
	return icon ? (
		<button className={`btn-primary flex items-center justify-center gap-4 ${className!}`}>{children}</button>
	) : (
		<button onClick={() => onClick} className={`btn-primary ${className!}`}>
			{children}
		</button>
	);
};
