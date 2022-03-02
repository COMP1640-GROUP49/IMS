type InputProps = {
	type: string;
	required: boolean;
	placeholder?: string;
	value?: string;
	name?: string;
	onChange: React.ChangeEventHandler;
};

export const Input = ({ type, required, placeholder, value, name, onChange }: InputProps) => {
	return (
		<input
			value={value}
			name={name}
			onChange={onChange}
			required={required}
			className="self-stretch"
			placeholder={placeholder}
			type={type}
		/>
	);
};
