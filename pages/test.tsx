/* eslint-disable @typescript-eslint/no-misused-promises */
import { NextPage } from 'next';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Label } from 'components/Label';
import { IObjectKeys } from 'lib/objectKeys';
import supabase from 'utils/supabase';

const TestPage: NextPage = () => {
	interface IFormData extends IObjectKeys {
		username: string;
		password: string;
		role: string;
		department: string;
		email: string;
	}
	const [formData, setFormData] = useState<IFormData>();
	const [avatar, setAvatar] = useState('');

	const getAvatarFileUrl = async () => {
		const { data } = await supabase.storage.from('users').download('admin/avatars/admin-avatar');
		if (data) {
			const url = URL.createObjectURL(data);
			setAvatar(url);
		}
	};

	const handleRegister = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!formData!.email) {
			alert('error');
		} else {
			const data = await supabase.auth.signUp(
				{
					email: formData!['email'],
					password: formData!['password'],
				},
				{
					data: {
						username: formData!['username'],
						// role: formData!['role'],
						department: 1,
						// 		// 	// 	// account_full_name: formData!['name'],
						// 		// 	// 	// account_address: formData!['address'],
						// 		// 	// 	// account_phone_number: formData!['phone'],
						// 		// 	// 	// account_avatar_url: formData!['avatar'],
					},
				}
			);
			console.log(data);
		}
	};

	const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
		// For changing color of select options except the 1st option
		event.target.style.color = 'black';
		setFormData({
			...formData!,
			[event.target.name]: event.target.value.trim(),
		});
	};

	useEffect(() => {
		void getAvatarFileUrl();
	}, []);

	return (
		<div className="container flex justify-center">
			<form className="flex flex-col gap-4" onSubmit={handleRegister}>
				<Label size="16">Username</Label>
				<input placeholder="Input username" onChange={handleChange} name="username"></input>
				<Label size="16">Password</Label>
				<input onChange={handleChange} name="password"></input>
				<Label size="16">Role</Label>
				<select required defaultValue={'disabled'} onChange={handleChange} name="role">
					<option disabled value={'disabled'}>
						Select role
					</option>
					<option value="1">Admin</option>
					<option value="2">QA Manager</option>
					<option value="3">QA Coordinator</option>
				</select>
				<Label size="16">Department</Label>
				<select required defaultValue={'disabled'} onChange={handleChange} name="department">
					<option disabled value={'disabled'}>
						Select department
					</option>
					<option value="1">Admin Department</option>
					<option value="2">QA Department</option>
					<option value="3">IT Department</option>
				</select>
				<Label size="16">Email</Label>
				<input onChange={handleChange} name="email"></input>
				<button type="submit" className="btn-primary">
					Register
				</button>
				{avatar ? <Image src={avatar} width={'150'} height={'150'} alt="avatar" /> : null}
			</form>
		</div>
	);
};

export default TestPage;
