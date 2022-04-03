/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from 'next/router';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import AvatarUploader from 'components/AvatarUploader';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import { Select } from 'components/Select';
import { TextArea } from 'components/TextArea';
import {
	CheckEmailExisted,
	checkUsernameExisted,
	deleteAccount,
	modifyAvatarStorage,
	updateAccount,
	updateUserAvatar,
	uploadAvatar,
} from 'pages/api/admin';
import { IUserData } from 'pages/api/auth';
import { createNewCategory, updateCategory } from 'pages/api/category';
import { createDepartment, getDepartmentList, updateDepartment } from 'pages/api/department';
import { createNewTopic, updateTopic } from 'pages/api/topic';
import { updateProfile } from 'pages/api/user';
import { compareObject } from 'lib/compareObject';
import { ITopicData, IAccountData, IDepartmentData, IDepartmentsProps, ICategoryData } from 'lib/interfaces';
import { scrollToElement } from 'utils/scrollAnimate';

export const EditUserModal = ({ account }: IAccountData) => {
	const router = useRouter();
	const [formData, setFormData] = useState<IAccountData['account']>(account);
	const [departmentList, setDepartmentList] = useState<IDepartmentsProps>();
	const [formDataChanges, setFormDataChanges] = useState(false);
	const [avatar, setAvatar] = useState<File>();

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const handleShowDeleteModal = useCallback(() => {
		setShowDeleteModal(!showDeleteModal);
	}, [showDeleteModal]);

	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteModal(false);
	}, []);
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

		if (formData?.encrypted_password === account?.encrypted_password) {
			formData.encrypted_password = null!;
		}

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
					formData?.account_role.role_id as string,
					formData?.account_department.department_id as string,
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

	const handleDeleteAccount = async () => {
		await deleteAccount(account.account_id, account.username);
		router.reload();
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

	useEffect(() => {
		const getDepartmentData = async () => {
			const { data, error } = await getDepartmentList();
			setDepartmentList(data as unknown as IDepartmentsProps);
		};
		void getDepartmentData();
	}, []);

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
								<Select
									value={formData?.account_role?.role_id as string}
									name="account_role"
									required
									onChange={handleChange}
								>
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
									value={formData?.account_department?.department_id as string}
									required
									onChange={handleChange}
								>
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
								type="submit"
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
								type="button"
								onClick={handleShowDeleteModal}
								icon={true}
								className={` btn-primary md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
							>
								<Icon name="Save" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Delete account
							</Button>
							{showDeleteModal && (
								<Modal onCancel={handleCloseDeleteModal}>
									<div className="flex flex-col gap-6 justify-center">
										<p>
											Are you sure you want to delete this account{' '}
											<span className="font-semi-bold">@{account.username}</span>?
										</p>
										<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
											{/*TODO: Edit delete button box-shadow*/}
											<Button onClick={handleDeleteAccount} className="btn-danger w-full">
												Delete it
											</Button>
											<Button onClick={handleCloseDeleteModal} className="btn-secondary w-full">
												Cancel
											</Button>
										</div>
									</div>
								</Modal>
							)}
						</div>
					</form>
				</div>
			</main>
		</>
	);
};

export const EditProfilePage = ({ data }: any) => {
	const router = useRouter();
	const [formData, setFormData] = useState<IUserData>(data as IUserData);
	const [formDataChanges, setFormDataChanges] = useState(false);
	const [avatar, setAvatar] = useState<File>();

	interface IFormValidation {
		emailValidation: string;
		phoneValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>({
		emailValidation: 'loaded',
		phoneValidation: 'loaded',
	});

	const [isFormValidated, setIsFormValidated] = useState(false);

	const fileUpdate = (data: File) => {
		setAvatar(data);
		return avatar;
	};

	const fileUpload = async () => {
		if (avatar && formData?.user_metadata?.username) {
			try {
				const avatarUrl = await uploadAvatar(avatar, formData?.user_metadata?.username as string);
				formData.user_metadata.avatar = avatarUrl;
			} catch (error) {
				throw new Error('Avatar upload error!');
			}
		} else {
			formData.user_metadata.avatar = '';
		}
	};

	const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await fileUpload();

		// Check form validate before submit form
		if (formData?.email === undefined) {
			setFormValidation({
				...formValidation,
				emailValidation: 'error',
			});

			scrollToElement('email');
		} else {
			try {
				if (avatar) {
					await updateUserAvatar((data as IUserData)?.id, formData?.user_metadata?.avatar as string);
				}
				await updateProfile(
					(data as IUserData)?.id,
					(data as IUserData)?.user_metadata?.username as string,
					formData?.user_metadata?.full_name as string,
					formData?.email,
					formData?.user_metadata?.address as string,
					formData?.user_metadata?.phone as string
				);

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

		if (event.target.name === 'account_full_name') {
			setFormData({
				...formData,
				user_metadata: {
					...formData?.user_metadata,
					full_name: event.target.value,
				},
			});
		}

		if (event.target.name === 'account_address') {
			setFormData({
				...formData,
				user_metadata: {
					...formData?.user_metadata,
					address: event.target.value,
				},
			});
		}

		// email validation
		if (event.target.name === 'account_email') {
			setFormData({
				...formData,
				email: event.target.value.trim(),
			});

			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,
					emailValidation: 'warning',
				});
			} else if (event.target.value.trim() === (data as IUserData)?.email) {
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
			setFormData({
				...formData,
				user_metadata: {
					...formData?.user_metadata,
					phone: event.target.value,
				},
			});

			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,

					phoneValidation: 'loaded',
				});
			} else if (event.target.value.trim() === (data as IUserData)?.user_metadata?.phone) {
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
	};

	useEffect(() => {
		if (
			(formValidation?.emailValidation === 'success' || formValidation?.emailValidation === 'loaded') &&
			(formValidation?.phoneValidation === 'success' || formValidation?.phoneValidation === 'loaded')
		) {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}

		if (
			(formData?.email !== (data as IUserData)?.email && formData?.email !== '') ||
			(formData?.user_metadata?.full_name !== (data as IUserData)?.user_metadata?.full_name &&
				formData?.user_metadata?.full_name !== '') ||
			(formData?.user_metadata?.address !== (data as IUserData)?.user_metadata?.address &&
				formData?.user_metadata?.address !== '') ||
			(formData?.user_metadata?.phone !== (data as IUserData)?.user_metadata?.phone &&
				formData?.user_metadata?.phone !== '') ||
			typeof avatar !== 'undefined'
		) {
			setFormDataChanges(true);
		} else {
			setFormDataChanges(false);
		}
	}, [formValidation, isFormValidated, formData, avatar, data]);

	return data ? (
		<>
			<main className="below-navigation-bar form-container flex flex-col gap-6 p-6">
				<h1>{`Edit @${(data as IUserData)?.user_metadata?.username as string}'s Profile`}</h1>
				<div className="flex flex-col gap-6">
					<form onSubmit={handleUpdateProfile} className="form-edit flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<Label size="text-normal">Full name</Label>
								<Input
									name="account_full_name"
									value={formData?.user_metadata?.full_name as string}
									onChange={handleChange}
									required={false}
									placeholder={"Input account's full name"}
									type="text"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label size="text-normal">Email</Label>
								<Input
									name="account_email"
									value={formData?.email}
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

							<div className="flex flex-col gap-2">
								<Label size="text-normal">Address</Label>
								<Input
									name="account_address"
									value={formData.user_metadata?.address as string}
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
									value={formData.user_metadata?.phone as string}
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
								<AvatarUploader value={formData?.user_metadata?.avatar as string} fileUpdate={fileUpdate} size="150" />
							</div>
						</div>
						<div className="flex justify-between sm:flex-col sm:gap-4">
							<Button
								disabled={!formDataChanges || !isFormValidated ? true : false}
								icon={true}
								className={`${
									isFormValidated && formDataChanges ? `btn-primary` : `btn-disabled`
								}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
							>
								<Icon name="Save" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Save changes
							</Button>
						</div>
					</form>
				</div>
			</main>
		</>
	) : (
		<ClipLoader />
	);
};

export const CreateDepartmentModal = () => {
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [formDepartment, setFormDepartment] = useState<IDepartmentData>();
	const [formValidation, setFormValidation] = useState<IFormValidation>();
	const router = useRouter();
	interface IFormValidation {
		departmentNameValidation: string;
	}
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormDepartment({
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
			<MetaTags title={`Create New Department`} description="Create a new department" />
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
						<Icon name="PlusSquare" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
						Create department
					</Button>
				</div>
			</form>
		</>
	);
};

export const EditDepartmentModal = ({ department }: any) => {
	const [editDepartment, setEditDepartment] = useState<IDepartmentData['department']>(
		department as IDepartmentData['department']
	);
	const router = useRouter();
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [isFormDataChanges, setIsFormDataChanges] = useState(false);
	const [formValidation, setFormValidation] = useState<IFormValidation>();
	interface IFormValidation {
		departmentName: string;
	}
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEditDepartment({
			...editDepartment,
			[event.target.name]: event.target.value,
		});
		if (event.target.name !== '') {
			setFormValidation({
				...formValidation!,
				departmentName: 'success',
			});
		}
	};

	const handleUpdateDepartment = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await updateDepartment(editDepartment?.department_name, editDepartment?.department_id);
		router.reload();
	};
	useEffect(() => {
		if (formValidation?.departmentName === 'success') {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}

		if (editDepartment?.department_name === (department as IDepartmentData['department'])?.department_name) {
			setIsFormDataChanges(false);
		} else {
			setIsFormDataChanges(true);
		}
	}, [formValidation, isFormValidated, editDepartment, department]);
	return (
		<>
			<MetaTags
				title={`Edit ${(department as IDepartmentData['department']).department_name}`}
				description="Create a new user account"
			/>
			<form onSubmit={handleUpdateDepartment} className="flex flex-col gap-6">
				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<Label size="text-normal">Department Name</Label>
						<Input
							value={editDepartment?.department_name}
							name="department_name"
							onChange={handleChange}
							required
							placeholder={"Input department's name"}
							type="text"
						/>
					</div>
					<Button
						disabled={!isFormValidated && !isFormDataChanges}
						icon={true}
						className={`${
							isFormValidated && isFormDataChanges ? `btn-primary` : `btn-disabled`
						}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
					>
						<Icon name="Save" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
						Save change
					</Button>
				</div>
			</form>
		</>
	);
};

export const CreateTopicModal = ({ department_id }: any) => {
	const router = useRouter();
	const [formData, setFormData] = useState({});

	interface IFormValidation {
		topicNameValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>({
		topicNameValidation: '',
	});

	const [isFormValidated, setIsFormValidated] = useState(false);

	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[event.target.name]: event.target.value,
			department_id: department_id as string,
		});

		if (event.target.name === 'topic_name') {
			if (event.target.value === '') {
				setFormValidation({
					...formValidation,
					topicNameValidation: 'error',
				});
			} else {
				setFormValidation({
					...formValidation,
					topicNameValidation: 'success',
				});
			}
		}
	};

	const handleCreateNewTopic = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await createNewTopic(formData as ITopicData['topic']);
		router.reload();
	};

	useEffect(() => {
		if (
			formValidation.topicNameValidation === 'success' &&
			typeof (formData as ITopicData['topic'])?.topic_start_date !== 'undefined' &&
			typeof (formData as ITopicData['topic'])?.topic_first_closure_date !== 'undefined' &&
			typeof (formData as ITopicData['topic'])?.topic_final_closure_date !== 'undefined'
		) {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
	}, [formValidation, formData]);
	return (
		<>
			<MetaTags title={`Create New Topic`} description="Create a new user account" />
			<main>
				<div className="flex flex-col gap-6">
					<form onSubmit={handleCreateNewTopic} className="flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="form-field">
								<Label size="text-normal">Topic Name</Label>
								<Input
									onChange={handleChange}
									value={(formData as ITopicData['topic'])?.topic_name}
									name="topic_name"
									required={true}
									placeholder={"Input topics's name"}
									type="text"
								/>
								{formValidation &&
									(formValidation['topicNameValidation'] === 'success' ? (
										<div className="label-success">This topic name is valid.</div>
									) : formValidation['topicNameValidation'] === 'error' ? (
										<div className="label-warning">Please input the topic name.</div>
									) : null)}
							</div>
							<div className="form-field">
								<Label size="text-normal">Start Date</Label>
								<Input
									onChange={handleChange}
									value={(formData as ITopicData['topic'])?.topic_start_date}
									name="topic_start_date"
									required={true}
									placeholder={"Input topics's start date"}
									type="datetime-local"
								/>
							</div>
							<div className="form-field">
								<Label size="text-normal">First Closure Date</Label>
								<Input
									onChange={handleChange}
									value={(formData as ITopicData['topic'])?.topic_first_closure_date}
									name="topic_first_closure_date"
									required={true}
									placeholder={"Input topics's first closure date"}
									type="datetime-local"
								/>
							</div>
							<div className="form-field">
								<Label size="text-normal">Final Closure Date</Label>
								<Input
									onChange={handleChange}
									value={(formData as ITopicData['topic'])?.topic_final_closure_date}
									name="topic_final_closure_date"
									required={true}
									placeholder={"Input topics's final closure date"}
									type="datetime-local"
								/>
							</div>
							<div className="form-field">
								<Label optional size="text-normal">
									Topic Description
								</Label>
								<TextArea
									onChange={handleChange}
									value={(formData as ITopicData['topic'])?.topic_description}
									name="topic_description"
									required={false}
									placeholder={"Input topics's description"}
								/>
							</div>
							<Button
								disabled={!isFormValidated}
								icon={true}
								className={`${
									isFormValidated ? `btn-primary` : `btn-disabled`
								}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
							>
								<Icon name="FolderPlus" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Create topic
							</Button>
						</div>
					</form>
				</div>
			</main>
		</>
	);
};

export const EditTopicModal = ({ topicData }: any) => {
	const router = useRouter();
	const [formData, setFormData] = useState(topicData as ITopicData['topic']);
	const [formDataChanges, setFormDataChanges] = useState(false);
	const [isFormValidated, setIsFormValidated] = useState(true);

	interface IFormValidation {
		topicNameValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>({
		topicNameValidation: 'loaded',
	});

	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[event.target.name]: event.target.value,
		});

		if (event.target.name === 'topic_name') {
			if (event.target.value === '') {
				setFormValidation({
					...formValidation,
					topicNameValidation: 'error',
				});
			} else {
				setFormValidation({
					...formValidation,
					topicNameValidation: 'success',
				});
			}
		}
		if (event.target.name === 'topic_description') {
			if (event.target.value === '') {
				setFormData({
					...formData,
					topic_description: null!,
				});
			}
		}
	};

	const handleUpdateTopic = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		if (isFormValidated) {
			setFormData({
				...formData,
			});
		}
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await updateTopic(formData);
		router.reload();
	};

	useEffect(() => {
		if (
			formValidation.topicNameValidation === 'success' ||
			(formValidation.topicNameValidation === 'loaded' &&
				typeof formData?.topic_start_date !== 'undefined' &&
				typeof formData?.topic_first_closure_date !== 'undefined' &&
				typeof formData?.topic_final_closure_date !== 'undefined')
		) {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}

		compareObject(topicData as object, formData) ? setFormDataChanges(false) : setFormDataChanges(true);
	}, [formValidation, formData, topicData]);
	return (
		<>
			<MetaTags title={`Create New Topic`} description="Create a new user account" />
			<main>
				<div className="flex flex-col gap-6">
					<form onSubmit={handleUpdateTopic} className="flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="form-field">
								<Label size="text-normal">Topic Name</Label>
								<Input
									onChange={handleChange}
									value={formData?.topic_name}
									name="topic_name"
									required={true}
									placeholder={"Input topics's name"}
									type="text"
								/>
								{formValidation &&
									(formValidation['topicNameValidation'] === 'success' ? (
										<div className="label-success">This topic name is valid.</div>
									) : formValidation['topicNameValidation'] === 'error' ? (
										<div className="label-warning">Please input the topic name.</div>
									) : null)}
							</div>
							<div className="form-field">
								<Label size="text-normal">Start Date</Label>
								<Input
									onChange={handleChange}
									value={formData?.topic_start_date}
									name="topic_start_date"
									required={true}
									placeholder={"Input topics's start date"}
									type="datetime-local"
								/>
							</div>
							<div className="form-field">
								<Label size="text-normal">First Closure Date</Label>
								<Input
									onChange={handleChange}
									value={formData?.topic_first_closure_date}
									name="topic_first_closure_date"
									required={true}
									placeholder={"Input topics's first closure date"}
									type="datetime-local"
								/>
							</div>
							<div className="form-field">
								<Label size="text-normal">Final Closure Date</Label>
								<Input
									onChange={handleChange}
									value={formData?.topic_final_closure_date}
									name="topic_final_closure_date"
									required={true}
									placeholder={"Input topics's final closure date"}
									type="datetime-local"
								/>
							</div>
							<div className="form-field">
								<Label optional size="text-normal">
									Topic Description
								</Label>
								<TextArea
									onChange={handleChange}
									value={formData?.topic_description || ''}
									name="topic_description"
									required={false}
									placeholder={"Input topics's description"}
								/>
							</div>
							<Button
								disabled={!isFormValidated && !formDataChanges}
								icon={true}
								className={`${
									isFormValidated && formDataChanges ? `btn-primary` : `btn-disabled`
								}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
							>
								<Icon name="Save" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Save changes
							</Button>
						</div>
					</form>
				</div>
			</main>
		</>
	);
};

export const CareateCategoryModal = ({ topic_id }: any) => {
	const [formData, setFormData] = useState({});
	const router = useRouter();

	interface IFormValidation {
		categoryNameValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>();

	const [isFormValidated, setIsFormValidated] = useState(false);
	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[event.target.name]: event.target.value,
			topic_id: topic_id as string,
		});
		if (event.target.name.trim() !== '') {
			setFormValidation({
				...formValidation!,
				categoryNameValidation: 'success',
			});
		}
	};
	useEffect(() => {
		if (formValidation?.categoryNameValidation === 'success') {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
	}, [formValidation, isFormValidated]);
	const handleCreateNewCategory = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await createNewCategory(formData as ICategoryData['category']);
		router.reload();
	};
	return (
		<>
			<>
				<MetaTags title={`Create New Topic`} description="Create a new user account" />
				<main>
					<div className="flex flex-col gap-6">
						<form onSubmit={handleCreateNewCategory} className="flex flex-col gap-6">
							<div className="flex flex-col gap-4">
								<div className="form-field">
									<Label size="text-normal">Category Name</Label>
									<Input
										onChange={handleChange}
										name="category_name"
										required={true}
										placeholder={"Input topics's name"}
										type="text"
									/>
								</div>
								<div className="form-field">
									<Label optional size="text-normal">
										Category Description
									</Label>
									<TextArea
										onChange={handleChange}
										name="category_description"
										required={false}
										placeholder={"Input topics's description"}
									/>
								</div>
								<Button
									// disabled={!isFormValidated}
									icon={true}
									className={`${
										isFormValidated ? `btn-primary` : `btn-disabled`
									}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
								>
									<Icon name="FolderPlus" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
									Create categry
								</Button>
							</div>
						</form>
					</div>
				</main>
			</>
		</>
	);
};

export const EditCategoryModal = ({ categotyData }: any) => {
	const [formData, setFormData] = useState<ICategoryData['category']>(categotyData as ICategoryData['category']);
	const router = useRouter();
	interface IFormValidation {
		categoryNameValidation: string;
	}
	const [formValidation, setFormValidation] = useState<IFormValidation>();
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [isFormDataChanges, setIsFormDataChanges] = useState(false);

	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[event.target.name]: event.target.value,
		});
		if (event.target.name.trim() !== '') {
			setFormValidation({
				...formValidation!,
				categoryNameValidation: 'success',
			});
		}
	};
	useEffect(() => {
		if (formValidation?.categoryNameValidation === 'success') {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
		if (formData?.category_name === (categotyData as ICategoryData['category'])?.category_name) {
			setIsFormDataChanges(false);
		} else {
			setIsFormDataChanges(true);
		}
	}, [formValidation, isFormValidated, formData, categotyData]);
	const handleCreateNewCategory = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await updateCategory(formData);
		router.reload();
	};
	return (
		<>
			<MetaTags title={`Create New Topic`} description="Create a new user account" />
			<main>
				<div className="flex flex-col gap-6">
					<form onSubmit={handleCreateNewCategory} className="flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="form-field">
								<Label size="text-normal">Category Name</Label>
								<Input
									onChange={handleChange}
									name="category_name"
									required={true}
									value={formData.category_name}
									placeholder={"Input topics's name"}
									type="text"
								/>
							</div>
							<div className="form-field">
								<Label optional size="text-normal">
									Category Description
								</Label>
								<TextArea
									onChange={handleChange}
									name="category_description"
									value={formData?.category_description}
									required={false}
									placeholder={"Input topics's description"}
								/>
							</div>
							<Button
								disabled={!isFormValidated && !isFormDataChanges}
								icon={true}
								className={`${
									isFormValidated && isFormDataChanges ? `btn-primary` : `btn-disabled`
								}  md:lg:self-start md:px-4 md:py-2 lg:self-start lg:px-4 lg:py-2`}
							>
								<Icon name="FolderPlus" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Edit category
							</Button>
						</div>
					</form>
				</div>
			</main>
		</>
	);
};
