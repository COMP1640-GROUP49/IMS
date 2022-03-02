/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { Select } from 'components/Select';

interface InputProps {
	username?: string;
	password?: string;
	roles?: string;
	department?: string;
	fullname?: string;
	email?: string;
	address?: string;
	phonenumber?: string;
	avartar?: string;
}

export const CreateNewUsers = () => {
	const [form, setForm] = useState<InputProps>();

	const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log(form);
	};
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		const { name, value } = event.target;
		setForm({ ...form, [name]: value });
	};
	return (
		<div className="flex flex-1 flex-wrap flex-col gap-6 p-6 lg:px-80">
			<h1 className="text-heading-4 font-semibold">Create New User Account</h1>
			<form onSubmit={handleCreate} className="flex flex-1 flex-col flex-wrap gap-3">
				<div>
					<h3 className="font-semibold">Account</h3>
					<hr />
				</div>
				<div className="flex flex-col gap-2">
					<Label size="text-subtitle">Username</Label>
					<Input
						name="username"
						value={form?.username || ''}
						onChange={handleChange}
						required={true}
						placeholder={'Input User Name'}
						type="text"
					></Input>
				</div>
				<div className="flex flex-col gap-2 relative">
					<Label size="text-subtitle">Password</Label>
					<Input
						name="password"
						value={form?.password || ''}
						onChange={handleChange}
						required={true}
						placeholder={'Input User Password'}
						type="text"
					></Input>
					<button>
						<Icon name="Eye" size="32" color="gray" className="absolute bottom-4 right-2"></Icon>
					</button>
				</div>
				<div className="flex flex-col gap-2">
					<Label size="text-subtitle">Roles</Label>
					<Select
						name="roles"
						value={form?.roles || ''}
						onChange={handleChange}
						required={false}
						placeholder={'Input User Password'}
					>
						<option>Choose Roles</option>
						<option value="admin">Admin</option>
						<option value="staff">Staff</option>
						<option value="qamanager">QA Manager</option>
					</Select>
				</div>
				<div className="flex flex-col gap-2">
					<Label size="text-subtitle">Department</Label>
					<Select
						name="department"
						value={form?.department || ''}
						onChange={handleChange}
						required={false}
						placeholder={'Input User Password'}
					>
						<option>Choose Department</option>
						<option value="it">IT</option>
						<option value="business">Business</option>
						<option value="designer">Designer</option>
					</Select>
				</div>

				<div>
					<Label size="text-subtitle" optional>
						Infomation
					</Label>
					<hr />
				</div>
				<div className="flex flex-col gap-2">
					<Label size="text-subtitle">Full name</Label>
					<Input
						name="fullname"
						value={form?.fullname || ''}
						onChange={handleChange}
						required={true}
						placeholder={'Input Full Name'}
						type="text"
					></Input>
				</div>
				<div className="flex flex-col gap-2">
					<Label size="text-subtitle">Email</Label>
					<Input
						name="email"
						value={form?.email || ''}
						onChange={handleChange}
						required={true}
						placeholder={'Input Email'}
						type="text"
					></Input>
				</div>
				<div className="flex flex-col gap-2">
					<Label size="text-subtitle">Address</Label>
					<Input
						name="address"
						value={form?.address || ''}
						onChange={handleChange}
						required={true}
						placeholder={'Input Address'}
						type="text"
					></Input>
				</div>
				<div className="flex flex-col gap-2">
					<Label size="text-subtitle">Phone number</Label>
					<Input
						name="phonenumber"
						value={form?.phonenumber || ''}
						onChange={handleChange}
						required={true}
						placeholder={'Input Phone Number'}
						type="text"
					></Input>
				</div>
				<div className="flex flex-col gap-2">
					<Label size="text-subtitle">Avartar</Label>
					<input
						name="avartar"
						value={form?.avartar || ''}
						onChange={handleChange}
						required={true}
						placeholder={'Input Phone Number'}
						type="file"
					></input>
					<br />
					<div className="ml-0"></div>
				</div>

				<Button icon={true} className={'md:self-start md:px-12 md:py-4 lg:self-start  lg:px-12 lg:py-4'}>
					<Icon name="Plus" size="16" color="white" />
					Log In
				</Button>
			</form>
		</div>
	);
};
