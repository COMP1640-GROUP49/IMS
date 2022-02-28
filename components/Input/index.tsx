type InputProps = {
	type: string;
	required: boolean;
	placeholder?: string;
	value: string;
	onChange: React.ChangeEventHandler;
};

export const Input = ({ type, required, placeholder, value, onChange }: InputProps) => {
	return (
		<input
			value={value}
			onChange={onChange}
			required={required}
			className="self-stretch"
			placeholder={placeholder}
			type={type}
		/>
	);
};
