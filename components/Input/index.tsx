type InputProps = {
	type: string;
	required: boolean;
	placeholder?: string;
	value?: string;
	name?: string;
	onChange: React.ChangeEventHandler<HTMLInputElement>;
	pattern?: string;
	autocomplete?: string;
};

export const Input = ({ type, required, placeholder, value, name, onChange, pattern, autocomplete }: InputProps) => {
	return (
		<input
			value={value}
			/**
			 * https://www.chromium.org/developers/design-documents/create-amazing-password-forms/
			 */
			autoComplete={autocomplete}
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
