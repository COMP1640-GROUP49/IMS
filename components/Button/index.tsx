type ButtonProps = {
	type?: 'button' | 'submit' | 'reset' | undefined;
	children: React.ReactNode;
	icon?: boolean;
	className?: string;
	onClick?: (event: React.FormEvent) => void;
};

export const Button = ({ type, icon, children, className, onClick }: ButtonProps) => {
	return icon ? (
		<button
			type={type}
			onClick={onClick}
			className={`btn-primary flex items-center justify-center gap-4 ${className!}`}
		>
			{children}
		</button>
	) : (
		<button type={type} onClick={onClick} className={`btn-primary ${className!}`}>
			{children}
		</button>
	);
};
