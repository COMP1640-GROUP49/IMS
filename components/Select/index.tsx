type InputProps = {
	required: boolean;
	placeholder?: string;
	name: string;
	value: string;
	children: React.ReactNode;
	onChange: React.ChangeEventHandler;
};

export const Select = ({ name, value, required, placeholder, onChange, children }: InputProps) => {
	return (
		<select
			name={name}
			value={value}
			onChange={onChange}
			required={required}
			className="self-stretch py-3 border-[1px] border-gray-300 hover:border-[2px] hover:border-slate-900 rounded-lg"
			placeholder={placeholder}
		>
			{children}
		</select>
	);
};
