type LabelProps = {
	children: string;
	optional?: boolean;
	size: string;
};

export const Label = ({ children, size, optional }: LabelProps) => {
	return optional ? (
		<div className={`flex w-full justify-between items-center ${size}`}>
			<p className="font-semi-bold">{children}</p>
			<p className="font-semi-bold text-sonic-silver">Optional</p>
		</div>
	) : (
		<div className={`flex w-full items-center ${size}`}>
			<p className="font-semi-bold">{children}</p>
		</div>
	);
};
