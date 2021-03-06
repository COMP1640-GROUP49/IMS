/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from 'next/router';
import React, { FormEvent, useContext, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import AvatarUploader from 'components/AvatarUploader';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { MetaTags } from 'components/MetaTags';
import { UserContext } from 'components/PrivateRoute';
import { Select } from 'components/Select';
import {
	CheckEmailExisted,
	checkUsernameExisted,
	createNewAccount,
	IFormData,
	keepAdminSession,
	uploadAvatar,
} from 'pages/api/admin';
import { getDepartmentList } from 'pages/api/department';
import { IDepartmentData, IDepartmentsProps } from 'lib/interfaces';
import { scrollToElement } from 'utils/scrollAnimate';

const CreateNewUser = () => {
	const [formData, setFormData] = useState<IFormData>();
	const [avatar, setAvatar] = useState<File>();
	const [departmentList, setDepartmentList] = useState<IDepartmentsProps>();

	const router = useRouter();

	interface IFormValidation {
		usernameValidation: string;
		passwordValidation: string;
		emailValidation: string;
		roleValidation: string;
		departmentValidation: string;
		phoneValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>();
	const [isFormValidated, setIsFormValidated] = useState(false);

	const fileUpdate = (data: File) => {
		setAvatar(data);
		return avatar;
	};

	const fileUpload = async () => {
		if (avatar && formData!['username']) {
			try {
				const avatarUrl = await uploadAvatar(avatar, formData!['username']);
				formData!['avatar'] = avatarUrl;
			} catch (error) {
				throw new Error('Avatar upload error!');
			}
		} else {
			formData!['avatar'] = '';
		}
	};

	const handleCreateNewAccount = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await fileUpload();

		// Check form validate before submit form
		if (formData?.role === undefined) {
			setFormValidation({
				...formValidation!,
				roleValidation: 'error',
			});

			scrollToElement('select-role');
		} else if (formData?.department === undefined) {
			setFormValidation({
				...formValidation!,
				departmentValidation: 'error',
			});
			scrollToElement('select-department');
		} else {
			try {
				const { newUserData, adminSession } = await createNewAccount(formData);
				if (newUserData) {
					await keepAdminSession(adminSession?.refresh_token as string);
					void router.reload();
				}
			} catch (error) {
				throw error;
			}
		}
	};

	const handleChange = async (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
		// For changing color of select options except the 1st option
		event.target.style.color = 'black';

		setFormData({
			...formData!,
			[event.target.name]: event.target.value.trim(),
		});

		// username validation
		if (event.target.name === 'username') {
			setFormValidation({
				...formValidation!,
				usernameValidation: '',
			});

			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation!,
					usernameValidation: 'warning',
				});
			} else {
				const usernameCheckResult = await checkUsernameExisted(event.target.value.trim());

				if (formValidation) {
					if (event.target.value.trim() !== '') {
						if (!usernameCheckResult) {
							setFormValidation({
								...formValidation,
								usernameValidation: 'success',
							});
						} else {
							setFormValidation({
								...formValidation,
								usernameValidation: 'error',
							});
						}
					}
				}
			}
		}

		// password validation
		if (event.target.name === 'password') {
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation!,

					passwordValidation: 'warning',
				});
			} else {
				const passwordCheckResult = event.target.value.length >= 6;

				if (passwordCheckResult) {
					setFormValidation({
						...formValidation!,

						passwordValidation: 'success',
					});
				} else {
					setFormValidation({
						...formValidation!,

						passwordValidation: 'error',
					});
				}
			}
		}

		// email validation
		if (event.target.name === 'email') {
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation!,

					emailValidation: 'warning',
				});
			} else {
				/**
				 * Took this regex from General Email Regex (RFC 5322 Official Standard) - https://emailregex.com/
				 */
				const emailRegex =
					/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

				const emailCheckExistedResult = await CheckEmailExisted(event.target.value.trim());
				const emailRegexCheck = event.target.value.match(emailRegex);

				// BUG: typing too  fast cause confusing validation's results
				if (emailCheckExistedResult) {
					setFormValidation({
						...formValidation!,

						emailValidation: 'error-existed',
					});
				} else if (!emailRegexCheck) {
					setFormValidation({
						...formValidation!,

						emailValidation: 'error-format',
					});
				} else if (!emailCheckExistedResult && emailRegexCheck) {
					setFormValidation({
						...formValidation!,

						emailValidation: 'success',
					});
				}
			}
		}

		// phone validate
		if (event.target.name === 'phone') {
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation!,

					phoneValidation: '',
				});
			} else {
				/**
				 * Took this regex from https://www.regextester.com/106725
				 */
				const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
				const phoneCheckResult = event.target.value.match(phoneRegex);
				if (phoneCheckResult) {
					setFormValidation({
						...formValidation!,

						phoneValidation: 'success',
					});
				} else {
					setFormValidation({
						...formValidation!,

						phoneValidation: 'warning',
					});
				}
			}
		}

		if (event.target.name === 'role') {
			if (event.target.value !== 'disabled') {
				setFormValidation({
					...formValidation!,

					roleValidation: 'success',
				});
			}
		}
		if (event.target.name === 'department') {
			if (event.target.value !== 'disabled') {
				setFormValidation({
					...formValidation!,

					departmentValidation: 'success',
				});
			}
		}
	};

	useEffect(() => {
		const getDepartmentData = async () => {
			const { data, error } = await getDepartmentList();
			setDepartmentList(data as unknown as IDepartmentsProps);
		};
		void getDepartmentData();

		if (
			formValidation?.usernameValidation === 'success' &&
			formValidation?.passwordValidation === 'success' &&
			formValidation?.emailValidation === 'success'
		) {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
	}, [formValidation, isFormValidated]);

	const user = useContext(UserContext);

	return (
		<>
			{user ? (
				+user.user_metadata?.role === 0 ? (
					<>
						<MetaTags title="Create New User Account" description="Create a new user account" />
						<Header />
						<main className="below-navigation-bar">
							<div className="form-container flex flex-col gap-6 p-6">
								<h1>Create New User Account</h1>
								<form onSubmit={handleCreateNewAccount} className="flex flex-col gap-6">
									<div className="flex flex-col gap-4">
										<div className="flex flex-col gap-2">
											<Label size="text-subtitle">Account</Label>
											<hr />
										</div>
										<div className="flex flex-col gap-2">
											<Label size="text-normal">Username</Label>
											<Input
												name="username"
												onChange={handleChange}
												required
												placeholder={"Input account's username"}
												type="text"
											/>
											{formValidation &&
												(formValidation['usernameValidation'] === 'success' ? (
													<div className="label-success">This username is available.</div>
												) : formValidation['usernameValidation'] === 'warning' ? (
													<div className="label-warning">Please input the username.</div>
												) : formValidation['usernameValidation'] === 'error' ? (
													<div className="label-error">This username is not available. Please choose another one.</div>
												) : null)}
										</div>
										<div className="flex flex-col gap-2">
											<Label size="text-normal">Password</Label>
											<Input
												name="password"
												onChange={handleChange}
												required
												placeholder={"Input account's password"}
												type="password"
											/>
											{/* TODO: Show/hide password */}
											{/* <button>
									<Icon name="Eye" size="32" color="gray" className="absolute bottom-4 right-2"></Icon>
								</button> */}
											{formValidation &&
												(formValidation['passwordValidation'] === 'success' ? (
													<div className="label-success">This password is valid.</div>
												) : formValidation['passwordValidation'] === 'warning' ? (
													<div className="label-warning">Please input the password.</div>
												) : formValidation['passwordValidation'] === 'error' ? (
													<div className="label-error">Password must be greater than 6 characters.</div>
												) : null)}
										</div>
										<div id="select-role" className="flex flex-col gap-2">
											<Label size="text-normal">Role</Label>
											<Select name="role" required defaultValue={'disabled'} onChange={handleChange}>
												<option disabled value={'disabled'}>
													{"Select account's role"}
												</option>
												<option value="0">Admin</option>
												<option value="1">QA Manager</option>
												<option value="2">QA Coordinator</option>
												<option value="3">Staff</option>
											</Select>
											{formValidation &&
												(formValidation['roleValidation'] === 'error' ? (
													<div className="label-warning">Please select role for account.</div>
												) : null)}
										</div>
										<div id="select-department" className="flex flex-col gap-2">
											<Label size="text-normal">Department</Label>
											<Select name="department" required defaultValue={'disabled'} onChange={handleChange}>
												<option disabled value={'disabled'}>
													{"Select account's department"}
												</option>
												{departmentList ? (
													(departmentList as unknown as []).map((department) => (
														<option
															key={(department as IDepartmentData['department']).department_id}
															value={(department as IDepartmentData['department']).department_id}
														>
															{(department as IDepartmentData['department']).department_name}
														</option>
													))
												) : (
													<ClipLoader />
												)}
											</Select>
											{formValidation &&
												(formValidation['roleValidation'] === 'error' ? (
													<div className="label-warning">Please select department for account.</div>
												) : null)}
										</div>
										<div className="flex flex-col gap-2">
											<Label size="text-normal">Email</Label>
											<Input
												name="email"
												onChange={handleChange}
												required
												placeholder={"Input account's email"}
												type="email"
											/>
											{formValidation &&
												(formValidation['emailValidation'] === 'success' ? (
													<div className="label-success">This email address is valid.</div>
												) : formValidation['emailValidation'] === 'warning' ? (
													<div className="label-warning">Please input the email address.</div>
												) : formValidation['emailValidation'] === 'error-format' ? (
													<div className="label-error">
														This email has an invalid email address format. Please try again.
													</div>
												) : formValidation['emailValidation'] === 'error-existed' ? (
													<div className="label-error">
														This email has been registered in the system. Please try another one.
													</div>
												) : null)}
										</div>
									</div>
									<div className="flex flex-col gap-4">
										<div className="flex flex-col gap-2">
											<Label optional size="text-subtitle">
												Information
											</Label>
											<hr />
										</div>
										<div className="flex flex-col gap-2">
											<Label size="text-normal">Full name</Label>
											<Input
												name="full_name"
												onChange={handleChange}
												required={false}
												placeholder={"Input account's full name"}
												type="text"
											/>
										</div>

										<div className="flex flex-col gap-2">
											<Label size="text-normal">Address</Label>
											<Input
												name="address"
												onChange={handleChange}
												required={false}
												placeholder={"Input account's address"}
												type="text"
											/>
										</div>
										<div className="flex flex-col gap-2">
											<Label size="text-normal">Phone number</Label>
											<Input
												name="phone"
												onChange={handleChange}
												required={false}
												placeholder={"Input account's phone number"}
												type="tel"
											/>
											{formValidation && formValidation['phoneValidation'] === 'warning' ? (
												<div className="label-warning">Invalid phone number format.</div>
											) : formValidation && formValidation['phoneValidation'] === 'success' ? (
												<div className="label-success">This phone number is valid.</div>
											) : null}
										</div>
										<div className="flex flex-col gap-2">
											<Label size="text-normal">Avatar</Label>
											<AvatarUploader fileUpdate={fileUpdate} size="150" />
										</div>
									</div>

									<Button
										disabled={!isFormValidated}
										icon={true}
										className={`${
											isFormValidated ? `btn-primary` : `btn-disabled`
										}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
									>
										<Icon name="Plus" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
										Create new user account
									</Button>
								</form>
							</div>
						</main>
					</>
				) : (
					<ClipLoader />
				)
			) : (
				<ClipLoader />
			)}
		</>
	);
};

export default CreateNewUser;
