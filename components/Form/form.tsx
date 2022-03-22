/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import AvatarUploader from 'components/AvatarUploader';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { MetaTags } from 'components/MetaTags';
import { Select } from 'components/Select';
import {
	CheckEmailExisted,
	checkUsernameExisted,
	modifyAvatarStorage,
	updateAccount,
	updateUserAvatar,
	uploadAvatar,
} from 'pages/api/admin';
import { IAccountData } from 'lib/interfaces';
import { scrollToElement } from 'utils/scrollAnimate';

export const EditUserModal = ({ account }: IAccountData) => {
	const router = useRouter();
	const [formData, setFormData] = useState<IAccountData['account']>(account);
	const [formDataChanges, setFormDataChanges] = useState(false);
	const [avatar, setAvatar] = useState<File>();

	interface IFormValidation {
		usernameValidation: string;
		passwordValidation: string;
		emailValidation: string;
		roleValidation: string;
		departmentValidation: string;
		phoneValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>({
		usernameValidation: 'loaded',
		passwordValidation: 'loaded',
		emailValidation: 'loaded',
		roleValidation: 'loaded',
		departmentValidation: 'loaded',
		phoneValidation: 'loaded',
	});

	const [isFormValidated, setIsFormValidated] = useState(false);

	const fileUpdate = (data: File) => {
		setAvatar(data);
		return avatar;
	};

	const fileUpload = async () => {
		if (avatar && formData['username']) {
			try {
				const avatarUrl = await uploadAvatar(avatar, formData['username']);
				formData['avatar_url'] = avatarUrl;
			} catch (error) {
				throw new Error('Avatar upload error!');
			}
		} else {
			formData['avatar_url'] = '';
		}
	};

	const handleUpdateAccount = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await fileUpload();

		// Check form validate before submit form
		if (formData?.account_role === undefined) {
			setFormValidation({
				...formValidation,
				roleValidation: 'error',
			});

			scrollToElement('select-role');
		} else if (formData?.account_department === undefined) {
			setFormValidation({
				...formValidation,
				departmentValidation: 'error',
			});
			scrollToElement('select-department');
		} else {
			try {
				if (avatar) {
					await updateUserAvatar(account.account_id, formData?.avatar_url as string);
				}
				await updateAccount(
					account.account_id,
					formData?.username,
					formData?.encrypted_password,
					formData?.account_role.role_id,
					formData?.account_department.department_id,
					formData?.account_email,
					formData?.account_full_name,
					formData?.account_address,
					formData?.account_phone_number
				);

				if (formData?.username !== account.username) {
					const newUsername = formData?.username;
					const oldUsername = account.username;
					await modifyAvatarStorage(oldUsername, newUsername);
				}

				router.reload();
			} catch (error) {
				throw error;
			}
		}
	};

	const handleChange = async (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
		// For changing color of select options except the 1st option
		event.target.style.color = 'black';

		// Convert from role, department id -> name
		setFormData({
			...formData,
			[event.target.name]: event.target.value,
		});

		if (event.target.name === 'account_role') {
			setFormData({
				...formData,
				account_role: {
					role_id: event.target.value.trim(),
				},
			});
		}
		if (event.target.name === 'account_department') {
			setFormData({
				...formData,
				account_department: {
					department_id: event.target.value.trim(),
				},
			});
		}

		// username validation
		if (event.target.name === 'username') {
			setFormValidation({
				...formValidation,
				usernameValidation: '',
			});

			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,
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
						} else if (event.target.value.trim() === account.username) {
							setFormValidation({
								...formValidation,
								usernameValidation: 'loaded',
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
		if (event.target.name === 'encrypted_password') {
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,

					passwordValidation: 'loaded',
				});
			} else {
				const passwordCheckResult = event.target.value.length >= 6;

				if (passwordCheckResult) {
					setFormValidation({
						...formValidation,

						passwordValidation: 'success',
					});
				} else {
					setFormValidation({
						...formValidation,

						passwordValidation: 'error',
					});
				}
			}
		}

		// email validation
		if (event.target.name === 'account_email') {
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,

					emailValidation: 'warning',
				});
			} else if (event.target.value.trim() === account.account_email) {
				setFormValidation({
					...formValidation,
					emailValidation: 'loaded',
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
						...formValidation,

						emailValidation: 'error-existed',
					});
				} else if (!emailRegexCheck) {
					setFormValidation({
						...formValidation,

						emailValidation: 'error-format',
					});
				} else if (!emailCheckExistedResult && emailRegexCheck) {
					setFormValidation({
						...formValidation,

						emailValidation: 'success',
					});
				}
			}
		}

		// phone validate
		if (event.target.name === 'account_phone_number') {
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,

					phoneValidation: 'loaded',
				});
			} else if (event.target.value.trim() === account.account_phone_number) {
				setFormValidation({
					...formValidation,
					phoneValidation: 'loaded',
				});
			} else {
				/**
				 * Took this regex from https://www.regextester.com/106725
				 */
				const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
				const phoneCheckResult = event.target.value.match(phoneRegex);
				if (phoneCheckResult) {
					setFormValidation({
						...formValidation,

						phoneValidation: 'success',
					});
				} else {
					setFormValidation({
						...formValidation,

						phoneValidation: 'warning',
					});
				}
			}
		}

		if (event.target.name === 'account_role') {
			if (event.target.value !== 'disabled') {
				setFormValidation({
					...formValidation,

					roleValidation: 'success',
				});
			} else if (event.target.value === account.account_role.role_id) {
				setFormValidation({
					...formValidation,
					roleValidation: 'loaded',
				});
			}
		}
		if (event.target.name === 'account_department') {
			if (event.target.value !== 'disabled') {
				setFormValidation({
					...formValidation,

					departmentValidation: 'success',
				});
			} else if (event.target.value === account.account_department.department_id) {
				setFormValidation({
					...formValidation,
					departmentValidation: 'loaded',
				});
			}
		}
	};

	useEffect(() => {
		if (
			(formValidation?.usernameValidation === 'success' || formValidation?.usernameValidation === 'loaded') &&
			(formValidation?.passwordValidation === 'success' || formValidation?.passwordValidation === 'loaded') &&
			(formValidation?.emailValidation === 'success' || formValidation?.emailValidation === 'loaded') &&
			(formValidation?.roleValidation === 'success' || formValidation?.roleValidation === 'loaded') &&
			(formValidation?.departmentValidation === 'success' || formValidation?.departmentValidation === 'loaded') &&
			(formValidation?.phoneValidation === 'success' || formValidation?.phoneValidation === 'loaded')
		) {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}

		if (
			formData?.username !== account.username ||
			(formData?.encrypted_password !== account.encrypted_password && formData?.encrypted_password !== '') ||
			formData?.account_role !== account.account_role ||
			formData?.account_department !== account.account_department ||
			formData?.account_email !== account.account_email ||
			(formData?.account_full_name !== account.account_full_name && formData?.account_full_name !== '') ||
			(formData?.account_address !== account.account_address && formData?.account_address !== '') ||
			(formData?.account_phone_number !== account.account_phone_number && formData?.account_phone_number !== '') ||
			typeof avatar !== 'undefined'
		) {
			setFormDataChanges(true);
		} else {
			setFormDataChanges(false);
		}
	}, [formValidation, isFormValidated, formData, account, avatar]);

	return (
		<>
			<MetaTags title={`Edit @${account.username} account`} description="Create a new user account" />
			{/* {console.log('formdataChange', formDataChanges, isFormValidated, formValidation)} */}
			<main>
				<div className="flex flex-col gap-6">
					<form onSubmit={handleUpdateAccount} className="form-edit flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label size="text-subtitle">Account</Label>
								<hr />
							</div>
							<div className="flex flex-col gap-2">
								<Label size="text-normal">Username</Label>
								<Input
									name="username"
									value={formData?.username || ''}
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
								<Label size="text-normal">New Password</Label>
								<Input
									name="encrypted_password"
									onChange={handleChange}
									required={false}
									placeholder={"Input account's new password if needed to change"}
									type="password"
								/>
								{/* TODO: Show/hide password */}
								{/* <button>
									<Icon name="Eye" size="32" color="gray" className="absolute bottom-4 right-2"></Icon>
								</button> */}
								{formValidation &&
									(formValidation['passwordValidation'] === 'success' ? (
										<div className="label-success">This password is valid.</div>
									) : formValidation['passwordValidation'] === 'error' ? (
										<div className="label-error">Password must be greater than 6 characters.</div>
									) : null)}
							</div>
							<div id="select-role" className="flex flex-col gap-2">
								<Label size="text-normal">Role</Label>
								<Select value={formData?.account_role?.role_id} name="account_role" required onChange={handleChange}>
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
								<Select
									name="account_department"
									value={formData?.account_department?.department_id}
									required
									onChange={handleChange}
								>
									<option disabled value={'disabled'}>
										{"Select account's department"}
									</option>
									<option value="0">Admin Department</option>
									<option value="1">QA Department</option>
									<option value="2">IT Department</option>
									<option value="3">Design Department</option>
									<option value="3">Business Department</option>
								</Select>
								{formValidation &&
									(formValidation['roleValidation'] === 'error' ? (
										<div className="label-warning">Please select department for account.</div>
									) : null)}
							</div>
							<div className="flex flex-col gap-2">
								<Label size="text-normal">Email</Label>
								<Input
									name="account_email"
									value={formData?.account_email || ''}
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
										<div className="label-error">This email has an invalid email address format. Please try again.</div>
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
									name="account_full_name"
									value={formData.account_full_name || ''}
									onChange={handleChange}
									required={false}
									placeholder={"Input account's full name"}
									type="text"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label size="text-normal">Address</Label>
								<Input
									name="account_address"
									value={formData.account_address || ''}
									onChange={handleChange}
									required={false}
									placeholder={"Input account's address"}
									type="text"
								/>
							</div>
							<div className="flex flex-col gap-2">
								<Label size="text-normal">Phone number</Label>
								<Input
									name="account_phone_number"
									value={formData.account_phone_number || ''}
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
								<AvatarUploader value={formData.avatar_url} fileUpdate={fileUpdate} size="150" />
							</div>
						</div>
						<div className="flex justify-between sm:flex-col sm:gap-4">
							<Button
								disabled={!formDataChanges || !isFormValidated ? true : false}
								icon={true}
								className={`${
									isFormValidated && formDataChanges ? `btn-secondary` : `btn-disabled`
								}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
							>
								<Icon name="Save" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Save changes
							</Button>
							<Button
								icon={true}
								className={` btn-primary md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
							>
								<Icon name="Save" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Delete account
							</Button>
						</div>
					</form>
				</div>
			</main>
		</>
	);
};