type InputProps = {
	type: string;
	required: boolean;
	placeholder?: string;
	value?: string;
	name?: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	pattern?: string;
};

export const Input = ({ type, required, placeholder, value, name, onChange, pattern }: InputProps) => {
	return (
		<input
			value={value}
			name={name}
			onChange={onChange}
			required={required}
			className="self-stretch"
			placeholder={placeholder}
			type={type}
			pattern={pattern}
		/>
	);
};
