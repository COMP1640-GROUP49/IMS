/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { checkDepartmentExisted, createDepartment } from 'pages/api/department';
import { IDepartmentsData } from 'lib/interfaces';

export const CreateDepartment = () => {
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [formDepartment, setFormDeparment] = useState<IDepartmentsData>();
	const [formValidation, setFormValidation] = useState<IFormValidation>();
	const router = useRouter();
	interface IFormValidation {
		departmentNameValidation: string;
	}
	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormDeparment({
			...formDepartment!,
			[event.target.name]: event.target.value.trim(),
		});
		if (event.target.name.trim() === 'department_name') {
			setFormValidation({
				...formValidation!,
				departmentNameValidation: '',
			});
			const departmentCheckResult = await checkDepartmentExisted(event.target.value.trim());
			if (formValidation) {
				if (event.target.value.trim() !== '') {
					if (!departmentCheckResult) {
						setFormValidation({
							...formValidation,
							departmentNameValidation: 'success',
						});
					} else {
						setFormValidation({
							...formValidation,
							departmentNameValidation: 'error',
						});
					}
				}
			}
		}
	};
	const handleCreateDepartment = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		console.log(formDepartment);
		try {
			const { newDepartment } = await createDepartment(formDepartment as IDepartmentsData);
			if (newDepartment) {
				void router.reload();
			}
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
						{formValidation &&
							(formValidation['departmentNameValidation'] === 'error' ? (
								<div className="label-error">This department is not available. Please choose another one.</div>
							) : null)}
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
