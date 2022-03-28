/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { createDepartment } from 'pages/api/department';
import { IDepartmentData } from 'lib/interfaces';

export const CreateDepartment = () => {
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [formDepartment, setFormDeparment] = useState<IDepartmentData>();
	const [formValidation, setFormValidation] = useState<IFormValidation>();
	const router = useRouter();
	interface IFormValidation {
		departmentNameValidation: string;
	}
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormDeparment({
			...formDepartment!,
			[event.target.name]: event.target.value.trim(),
		});
		if (event.target.name.trim() !== '') {
			setFormValidation({
				...formValidation!,
				departmentNameValidation: 'success',
			});
		}
	};
	const handleCreateDepartment = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		try {
			await createDepartment(formDepartment as IDepartmentData);
			void router.reload();
		} catch (error) {
			throw error;
		}
	};
	useEffect(() => {
		if (formValidation?.departmentNameValidation === 'success') {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
	}, [formValidation, isFormValidated]);
	return (
		<>
			<form onSubmit={handleCreateDepartment} className="flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label size="text-normal">Department Name</Label>
						<Input
							name="department_name"
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
