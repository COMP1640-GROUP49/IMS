type CheckboxProps = {
	children: React.ReactNode;
	name: string;
	className?: string;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

export const Checkbox = ({ name, children, className, onChange }: CheckboxProps) => {
	return (
		<div className={`${className as string} checkbox`}>
			<input onChange={onChange} name={name} type={'checkbox'} />
			{children}
		</div>
	);
};
