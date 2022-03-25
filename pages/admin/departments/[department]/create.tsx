import { FormEvent, useState } from 'react';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { IDepartments } from 'lib/interfaces';

export const CreateDepartment = () => {
	const [isFormValidated, setIsFormValidated] = useState(false);

	const [formDepartment, setFormDeparment] = useState<IDepartments>();
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(event);
		setFormDeparment({
			...formDepartment!,
			[event.target.name]: event.target.value.trim(),
		});
	};
	const handleCreateDepartment = (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		console.log(formDepartment);
	};
	return (
		<>
			<form onSubmit={handleCreateDepartment} className="flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label size="text-normal">Department Name</Label>
						<Input
							name="deparment_name"
							onChange={handleChange}
							required
							placeholder={"Input department's name"}
							type="text"
						/>
					</div>
					<Button
						disabled={!isFormValidated}
						icon={true}
						className={`${
							isFormValidated ? `btn-primary` : `btn-disabled`
						}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
					>
						<Icon name="Plus" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
						Create new department
					</Button>
				</div>
			</form>
		</>
	);
};
