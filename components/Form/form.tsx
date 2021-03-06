/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import AttachmentUploader from 'components/AttachmentUploader';
import AvatarUploader from 'components/AvatarUploader';
import { Button } from 'components/Button';
import { Checkbox } from 'components/Checkbox';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import RichTextEditor from 'components/RichTextEditor';
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
import { CheckCategoryExisted, createNewCategory, getCategoryListByTopicId, updateCategory } from 'pages/api/category';
import {
	createDepartment,
	getDepartmentNameFromTopicId,
	getDepartmentList,
	updateDepartment,
	getDepartmentIdByName,
	CheckDepartmentExisted,
} from 'pages/api/department';
import { sendEmailToCoordinatorInDepartment } from 'pages/api/email';
import { createNewIdea, removeIdeaAttachment, updateIdea, uploadAttachment } from 'pages/api/idea';
import { CheckTopicExisted, createNewTopic, getTopicById, getTopicIdByCategoryId, updateTopic } from 'pages/api/topic';
import { getAccountByAccountId, getAllCoordinatorEmailByDepartmentId, updateProfile } from 'pages/api/user';
import {
	ITopicData,
	IAccountData,
	IDepartmentData,
	IDepartmentsProps,
	ICategoryData,
	ICategoriesProps,
	IIdeaData,
} from 'lib/interfaces';
import { compareObject } from 'utils/compareObject';
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
	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormDepartment({
			...formDepartment!,
			[event.target.name]: event.target.value.trim(),
		});
		if ((event.target.name = 'department_name')) {
			if (event.target.value.trim() !== '') {
				const departmentCheckExistedResult = await CheckDepartmentExisted(event.target.value.trim());
				if (
					departmentCheckExistedResult &&
					departmentCheckExistedResult.department_name.toLowerCase() === event.target.value.trim().toLowerCase()
				) {
					setFormValidation({
						...formValidation,
						departmentNameValidation: 'error-existed',
					});
				} else {
					setFormValidation({
						...formValidation!,
						departmentNameValidation: 'success',
					});
				}
			}
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
						{formValidation &&
							(formValidation['departmentNameValidation'] === 'error-existed' ? (
								<div className="label-error">
									This department has existed. Please choose another name and try again.
								</div>
							) : (
								formValidation['departmentNameValidation'] === 'success' && (
									<div className="label-success">This department name is valid.</div>
								)
							))}
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
		departmentNameValidation: string;
	}
	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setEditDepartment({
			...editDepartment,
			[event.target.name]: event.target.value,
		});
		if ((event.target.name = 'department_name')) {
			if (event.target.value.trim() !== '') {
				if (event.target.value === (department as IDepartmentData['department']).department_name) {
					setFormValidation({
						...formValidation,
						departmentNameValidation: 'loaded',
					});
				} else {
					const departmentCheckExistedResult = await CheckDepartmentExisted(event.target.value.trim());
					if (
						departmentCheckExistedResult &&
						departmentCheckExistedResult.department_name.toLowerCase() === event.target.value.trim().toLowerCase()
					) {
						setFormValidation({
							...formValidation,
							departmentNameValidation: 'error-existed',
						});
					} else {
						setFormValidation({
							...formValidation!,
							departmentNameValidation: 'success',
						});
					}
				}
			}
		}
	};

	const handleUpdateDepartment = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await updateDepartment(editDepartment?.department_name, editDepartment?.department_id);
		router.reload();
	};
	useEffect(() => {
		if (formValidation?.departmentNameValidation === 'success') {
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
				description="Edit department"
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
						{formValidation &&
							(formValidation['departmentNameValidation'] === 'error-existed' ? (
								<div className="label-error">
									This department has existed. Please choose another name and try again.
								</div>
							) : (
								formValidation['departmentNameValidation'] === 'success' && (
									<div className="label-success">This department name is valid.</div>
								)
							))}
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

	const handleChange = async (
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
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,
					topicNameValidation: 'error',
				});
			} else {
				const topicCheckExistedResult = await CheckTopicExisted(event.target.value.trim());
				if (
					topicCheckExistedResult &&
					topicCheckExistedResult.topic_name.toLowerCase() === event.target.value.trim().toLowerCase()
				) {
					setFormValidation({
						...formValidation,
						topicNameValidation: 'error-existed',
					});
				} else {
					setFormValidation({
						...formValidation,
						topicNameValidation: 'success',
					});
				}
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
			<MetaTags title={`Create New Topic`} description="Create a new topic" />
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
								) : formValidation['topicNameValidation'] === 'error-existed' ? (
									<div className="label-error">This topic has existed. Please choose another name and try again.</div>
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

	const handleChange = async (
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
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,
					topicNameValidation: 'error',
				});
			} else {
				if (event.target.value.trim() === (topicData as ITopicData['topic']).topic_name) {
					setFormValidation({
						...formValidation,
						topicNameValidation: 'loaded',
					});
				} else {
					const topicCheckExistedResult = await CheckTopicExisted(event.target.value.trim());
					if (
						topicCheckExistedResult &&
						topicCheckExistedResult.topic_name.toLowerCase() === event.target.value.trim().toLowerCase()
					) {
						setFormValidation({
							...formValidation,
							topicNameValidation: 'error-existed',
						});
					} else {
						setFormValidation({
							...formValidation,
							topicNameValidation: 'success',
						});
					}
				}
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
			<MetaTags title={`Edit Topic`} description="Edit a topic" />
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
								) : formValidation['topicNameValidation'] === 'error-existed' ? (
									<div className="label-error">This topic has existed. Please choose another name and try again.</div>
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
		</>
	);
};

export const CreateCategoryModal = ({ topic_id }: any) => {
	const [formData, setFormData] = useState({});
	const router = useRouter();

	interface IFormValidation {
		categoryNameValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>();

	const [isFormValidated, setIsFormValidated] = useState(false);
	const handleChange = async (
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
		if (event.target.name === 'category_name') {
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,
					categoryNameValidation: 'error',
				});
			} else {
				const cateCheckExistedResult = await CheckCategoryExisted(event.target.value.trim());
				if (
					cateCheckExistedResult &&
					cateCheckExistedResult.category_name.toLowerCase() === event.target.value.trim().toLowerCase()
				) {
					setFormValidation({
						...formValidation,
						categoryNameValidation: 'error-existed',
					});
				} else {
					setFormValidation({
						...formValidation!,
						categoryNameValidation: 'success',
					});
				}
			}
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
				<MetaTags title={`Create New Category`} description="Create a new category" />
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
								{formValidation &&
									(formValidation['categoryNameValidation'] === 'success' ? (
										<div className="label-success">This category name is valid.</div>
									) : formValidation['categoryNameValidation'] === 'error' ? (
										<div className="label-warning">Please input the category name.</div>
									) : formValidation['categoryNameValidation'] === 'error-existed' ? (
										<div className="label-error">
											This category has existed. Please choose another name and try again.
										</div>
									) : null)}
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
								Create category
							</Button>
						</div>
					</form>
				</div>
			</>
		</>
	);
};

export const EditCategoryModal = ({ categoryData }: any) => {
	const [formData, setFormData] = useState<ICategoryData['category']>(categoryData as ICategoryData['category']);
	const router = useRouter();
	interface IFormValidation {
		categoryNameValidation: string;
	}
	const [formValidation, setFormValidation] = useState<IFormValidation>();
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [isFormDataChanges, setIsFormDataChanges] = useState(false);

	const handleChange = async (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		setFormData({
			...formData,
			[event.target.name]: event.target.value,
		});
		if (event.target.name === 'category_name') {
			if (event.target.value.trim() === '') {
				setFormValidation({
					...formValidation,
					categoryNameValidation: 'error',
				});
			} else {
				if (event.target.value.trim() === (categoryData as ICategoryData['category']).category_name) {
					setFormValidation({
						...formValidation,
						categoryNameValidation: 'loaded',
					});
				} else {
					const categoryCheckExistedResult = await CheckCategoryExisted(event.target.value.trim());
					if (
						categoryCheckExistedResult &&
						categoryCheckExistedResult.category_name.toLowerCase() === event.target.value.trim().toLowerCase()
					) {
						setFormValidation({
							...formValidation,
							categoryNameValidation: 'error-existed',
						});
					} else {
						setFormValidation({
							...formValidation,
							categoryNameValidation: 'success',
						});
					}
				}
			}
		}
	};
	useEffect(() => {
		if (formValidation?.categoryNameValidation === 'success') {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
		if (compareObject(formData, categoryData as object)) {
			setIsFormDataChanges(false);
		} else {
			setIsFormDataChanges(true);
		}
	}, [formValidation, isFormValidated, formData, categoryData]);
	const handleCreateNewCategory = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await updateCategory(formData);
		router.reload();
	};
	return (
		<>
			<MetaTags title={`Edit Category`} description="Edit a category" />
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
							{formValidation &&
								(formValidation['categoryNameValidation'] === 'success' ? (
									<div className="label-success">This category name is valid.</div>
								) : formValidation['categoryNameValidation'] === 'error' ? (
									<div className="label-warning">Please input the category name.</div>
								) : null)}
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
		</>
	);
};

export const CreateIdeaModal = ({ account_id, topic_id }: any) => {
	const [formData, setFormData] = useState<IIdeaData['idea']>();

	const router = useRouter();
	const { asPath } = useRouter();

	const [categoryList, setCategoryList] = useState<ICategoriesProps>();

	const [attachment, setAttachment] = useState<File>();

	interface IFormValidation {
		ideaTitleValidation: string;
		ideaCategoryValidation: string;
		termsConditionsValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>();

	const [isFormValidated, setIsFormValidated] = useState(false);

	const [formAutomaticEmail, setFormAutomaticEmail] = useState({
		qacoordinator_username: '',
		username: '',
		idea_name: '',
		topic_name: '',
		idea_link: typeof window !== 'undefined' && window.location.href,
		to_email: '',
	});

	const handleTermsConditionsCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
		if ((event.target as HTMLInputElement).checked) {
			setFormValidation({
				...formValidation!,
				termsConditionsValidation: 'success',
			});
		} else {
			setFormValidation({
				...formValidation!,
				termsConditionsValidation: 'error',
			});
		}
	};

	const handleEditorChange = (data: string) => {
		setFormData({
			...(formData as IIdeaData['idea']),
			idea_content: data,
		});
	};

	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		event.target.style.color = 'black';

		setFormData({
			...(formData as IIdeaData['idea']),
			[event.target.name]: event.target.value,
			account_id: account_id as string,
			anonymous_posting: formData?.anonymous_posting || false,
		});

		if (event.target.name === 'idea_title') {
			if (event.target.value.trim() !== '') {
				setFormValidation({
					...formValidation!,
					ideaTitleValidation: 'success',
				});
			} else {
				setFormValidation({
					...formValidation!,
					ideaTitleValidation: 'error',
				});
			}
			setFormAutomaticEmail({
				...formAutomaticEmail,
				idea_name: event.target.value,
			});
		}
		if (event.target.name === 'category_id') {
			if (event.target.value.trim() !== 'disabled') {
				setFormValidation({
					...formValidation!,
					ideaCategoryValidation: 'success',
				});
			} else {
				setFormValidation({
					...formValidation!,
					ideaCategoryValidation: 'error',
				});
			}
		}

		if (event.target.name === 'anonymous_posting') {
			setFormData({
				...(formData as IIdeaData['idea']),
				anonymous_posting: (event.target as HTMLInputElement).checked,
			});
		}
	};

	const fileUpdate = (data: File) => {
		setAttachment(data);
		return attachment;
	};

	const fileUpload = async () => {
		if (attachment && formData?.idea_title) {
			try {
				const { department_name } = await getDepartmentNameFromTopicId(topic_id as string);
				const attachmentUrl = await uploadAttachment(
					attachment,
					department_name,
					topic_id as string,
					formData.idea_title,
					formData.account_id,
					attachment.name
				);
				formData.idea_file_url = attachmentUrl;
			} catch (error) {
				throw new Error('Attachment upload error!');
			}
		} else {
			formData!.idea_file_url = '';
		}
	};

	useEffect(() => {
		const getCategoryData = async () => {
			const { data } = await getCategoryListByTopicId(topic_id as string);
			setCategoryList(data as unknown as ICategoriesProps);
		};
		void getCategoryData();

		const getAdditionalInfo = async () => {
			const { userData } = await getAccountByAccountId(account_id as string);
			const { department_name } = await getDepartmentNameFromTopicId(topic_id as string);
			const { department_id } = await getDepartmentIdByName(department_name);
			const { data: topicData } = await getTopicById(topic_id as string);
			const { emailList } = await getAllCoordinatorEmailByDepartmentId(department_id);
			const topic_name = (topicData as unknown as ITopicData['topic']).topic_name;
			setFormAutomaticEmail({
				...formAutomaticEmail,
				username: !formData?.anonymous_posting ? `@${userData?.username}` : 'An anonymous user',
				qacoordinator_username: `QA Coordinators of ${department_name}`,
				topic_name: topic_name,
				to_email: `${emailList}`,
			});
		};

		void getAdditionalInfo();

		if (
			formValidation?.termsConditionsValidation === 'success' &&
			formValidation.ideaTitleValidation === 'success' &&
			formValidation.ideaCategoryValidation === 'success'
		) {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}
	}, [formValidation, isFormValidated, formData, formData]);

	const handleCreateNewIdea = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();

		await fileUpload();
		// Check form validate before submit form
		if (formData?.category_id === undefined) {
			setFormValidation({
				...formValidation!,
				ideaCategoryValidation: 'error',
			});
			scrollToElement('select-category');
		} else {
			try {
				const data = await createNewIdea(formData);
				const { userData } = await getAccountByAccountId(account_id as string);
				if (+userData.account_role !== 2) {
					if (typeof document !== 'undefined') {
						const hiddenForm = document.getElementById('hidden-form');
						await sendEmailToCoordinatorInDepartment(hiddenForm as HTMLFormElement);
					}
				}
				// TODO: Go to the new idea page
				void router.push(`${asPath}/${data.idea_id}`);
				// void router.reload();
			} catch (error) {
				throw error;
			}
		}
	};

	return (
		<>
			<>
				<MetaTags title={`Create New Idea`} description="Submit new idea" />
				<div className="flex flex-col gap-6">
					<form id="hidden-form">
						<div className="field">
							<label htmlFor="qacoordinator_username">qacoordinator_username</label>
							<input
								defaultValue={formAutomaticEmail.qacoordinator_username}
								type="text"
								name="qacoordinator_username"
								id="qacoordinator_username"
							></input>
						</div>
						<div className="field">
							<label htmlFor="username">username</label>
							<input defaultValue={formAutomaticEmail.username} type="text" name="username" id="username"></input>
						</div>
						<div className="field">
							<label htmlFor="idea_name">idea_name</label>
							<input defaultValue={formAutomaticEmail.idea_name} type="text" name="idea_name" id="idea_name"></input>
						</div>
						<div className="field">
							<label htmlFor="topic_name">topic_name</label>
							<input defaultValue={formAutomaticEmail.topic_name} type="text" name="topic_name" id="topic_name"></input>
						</div>
						<div className="field">
							<label htmlFor="idea_link">idea_link</label>
							<input
								defaultValue={formAutomaticEmail.idea_link as string}
								type="text"
								name="idea_link"
								id="idea_link"
							></input>
						</div>
						<div className="field">
							<label htmlFor="reply_to">reply_to</label>
							<input type="text" name="reply_to" id="reply_to"></input>
						</div>
						<div className="field">
							<label htmlFor="to_email">to_email</label>
							<input defaultValue={formAutomaticEmail.to_email} type="text" name="to_email" id="to_email"></input>
						</div>
					</form>
					<form onSubmit={handleCreateNewIdea} className="flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="form-field">
								<Label size="text-normal">Title</Label>
								<Input
									onChange={handleChange}
									name="idea_title"
									required={true}
									placeholder={"Input idea's title"}
									type="text"
								/>
								{formValidation &&
									(formValidation['ideaTitleValidation'] === 'success' ? (
										<div className="label-success">This title name is valid.</div>
									) : formValidation['ideaTitleValidation'] === 'error' ? (
										<div className="label-warning">Please input the title of idea.</div>
									) : null)}
							</div>
							{/* TODO: onChange & value */}
							<div className="form-field">
								<Label optional size="text-normal">
									Content
								</Label>
								<RichTextEditor
									value={formData?.idea_content as string}
									handleEditorChange={handleEditorChange}
									placeholder={`Input idea's content`}
								/>
							</div>
							<div id="select-category" className="form-field">
								<Label size="text-normal">Category</Label>
								<Select defaultValue={'disabled'} name="category_id" required onChange={handleChange}>
									<option disabled value={'disabled'}>
										{"Select idea's category"}
									</option>
									{categoryList ? (
										(categoryList as unknown as []).map((category) => (
											<option
												key={(category as ICategoryData['category']).category_id}
												value={(category as ICategoryData['category']).category_id}
											>
												{(category as ICategoryData['category']).category_name}
											</option>
										))
									) : (
										<ClipLoader />
									)}
								</Select>
								{formValidation &&
									(formValidation['ideaCategoryValidation'] === 'error' ? (
										<div className="label-warning">Please select category for idea.</div>
									) : null)}
							</div>

							<div className="form-field">
								<Label optional size="text-normal">
									Attach Document
								</Label>
								<AttachmentUploader fileUpdate={fileUpdate} />
							</div>
							<Checkbox onChange={handleChange} name="anonymous_posting">
								<label htmlFor="anonymous_posting">
									Post as <span className="font-semi-bold">anonymous</span>
								</label>
							</Checkbox>
							<Checkbox onChange={handleTermsConditionsCheck} name="terms-conditions">
								<label htmlFor="terms-conditions">
									I agree to <span className="font-semi-bold">Terms and Conditions</span>
								</label>
							</Checkbox>

							<Button
								disabled={!isFormValidated}
								icon={true}
								className={`${isFormValidated ? `btn-primary` : `btn-disabled`}  self-start sm:self-stretch`}
							>
								<Icon name="FilePlus" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Submit idea
							</Button>
						</div>
					</form>
				</div>
			</>
		</>
	);
};

export const EditIdeaModal = ({ ideaData, topic_id }: any) => {
	const [formData, setFormData] = useState<IIdeaData['idea']>(ideaData as IIdeaData['idea']);
	const [hasFormDataChanged, setHasFormDataChanged] = useState(false);

	const router = useRouter();
	const { asPath } = useRouter();

	const [categoryList, setCategoryList] = useState<ICategoriesProps>();
	const [departmentName, setDepartmentName] = useState('');
	const [topicId, setTopicId] = useState('');

	const [attachment, setAttachment] = useState<File>();

	interface IFormValidation {
		ideaTitleValidation: string;
		ideaCategoryValidation: string;
	}

	const [formValidation, setFormValidation] = useState<IFormValidation>({
		ideaTitleValidation: 'loaded',
		ideaCategoryValidation: 'loaded',
	});

	const [isFormValidated, setIsFormValidated] = useState(false);

	const handleEditorChange = (data: string) => {
		setFormData({
			...formData,
			idea_content: data,
			idea_updated: moment().format(),
		});
	};

	const handleChange = (
		event:
			| React.ChangeEvent<HTMLInputElement>
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLTextAreaElement>
	) => {
		event.target.style.color = 'black';

		setFormData({
			...formData,
			[event.target.name]: event.target.value,
			idea_updated: moment().format(),
		});
		if (event.target.name === 'idea_title') {
			if (event.target.value.trim() !== '') {
				setFormValidation({
					...formValidation,
					ideaTitleValidation: 'success',
				});
			} else {
				setFormValidation({
					...formValidation,
					ideaTitleValidation: 'error',
				});
			}
		}
		if (event.target.name === 'category_id') {
			if (event.target.value.trim() !== 'disabled') {
				setFormValidation({
					...formValidation,
					ideaCategoryValidation: 'success',
				});
			} else {
				setFormValidation({
					...formValidation,
					ideaCategoryValidation: 'error',
				});
			}
		}

		if (event.target.name === 'anonymous_posting') {
			setFormData({
				...formData,
				anonymous_posting: (event.target as HTMLInputElement).checked,
			});
		}
	};

	const fileUpdate = (data: File, remove?: boolean) => {
		if (!data) {
			if (remove) {
				setFormData({
					...formData,
					idea_file_url: '',
					idea_updated: moment().format(),
				});
			} else {
				setFormData({
					...formData,
					idea_updated: moment().format(),
				});
			}
		} else {
			setAttachment(data);
			setFormData({
				...formData,
				idea_updated: moment().format(),
			});
		}
		return attachment;
	};

	const fileUpload = async () => {
		if (attachment && formData?.idea_title) {
			try {
				const { department_name } = await getDepartmentNameFromTopicId(topic_id as string);
				const attachmentUrl = await uploadAttachment(
					attachment,
					department_name,
					topic_id as string,
					formData.idea_title,
					formData.account_id,
					attachment.name,
					(ideaData as IIdeaData['idea']).idea_title
						.split('/')
						.pop()
						?.replaceAll(`${(ideaData as IIdeaData['idea']).idea_title}_`, '')
						.replaceAll(`_${formData.account_id}`, ''),
					(ideaData as IIdeaData['idea']).idea_title
				);
				formData.idea_file_url = attachmentUrl;
			} catch (error) {
				throw new Error('Attachment upload error!');
			}
		} else {
			if (!formData.idea_file_url) {
				const { department_name } = await getDepartmentNameFromTopicId(topic_id as string);
				await removeIdeaAttachment(
					(ideaData as IIdeaData['idea']).idea_title,
					department_name,
					topic_id as string,
					formData.account_id
				);
			}
		}
	};

	useEffect(() => {
		const getCategoryData = async () => {
			const { data } = await getCategoryListByTopicId(topic_id as string);
			data && setCategoryList(data as unknown as ICategoriesProps);
		};
		void getCategoryData();

		const getDepartmentNameAndTopicId = async () => {
			const { topicId } = await getTopicIdByCategoryId((ideaData as IIdeaData['idea']).category_id);
			topicId && setTopicId(topicId);

			const { department_name } = await getDepartmentNameFromTopicId(topicId);
			department_name && setDepartmentName(department_name);
		};
		void getDepartmentNameAndTopicId();

		if (
			((formValidation?.ideaTitleValidation === 'success' || formValidation?.ideaTitleValidation === 'loaded') &&
				formValidation?.ideaCategoryValidation === 'success') ||
			formValidation?.ideaCategoryValidation === 'loaded'
		) {
			setIsFormValidated(true);
		} else {
			setIsFormValidated(false);
		}

		if (compareObject(formData, ideaData as object)) {
			setHasFormDataChanged(false);
		} else {
			setHasFormDataChanged(true);
		}
	}, [formValidation, isFormValidated, formData, attachment, ideaData, topic_id]);

	const handleUpdateIdea = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await fileUpload();
		// Check form validate before submit form
		if (formData?.category_id === undefined) {
			setFormValidation({
				...formValidation,
				ideaCategoryValidation: 'error',
			});
			scrollToElement('select-category');
		} else {
			try {
				await updateIdea(formData);
				// const { data } = await getTopicById(topicId);
				// const topicName = (data as unknown as ITopicData['topic']).topic_name;
				// const { categoryData } = await getCategoryById(formData.category_id);
				// const categoryName = (categoryData as unknown as ICategoryData['category']).category_name;
				// await router.replace(
				// 	`admin/departments/${
				// 		departmentName.includes('Departments')
				// 			? `${asPath}/${departmentName.replace(` Departments`, ``).toLowerCase()}`
				// 			: departmentName.includes('departments')
				// 			? `${asPath}/${departmentName.replace(` departments`, ``).toLowerCase()}`
				// 			: departmentName.includes('Department')
				// 			? `${asPath}/${departmentName.replace(` Department`, ``).toLowerCase()}`
				// 			: departmentName.includes('department')
				// 			? `${asPath}/${departmentName.replace(` department`, ``).toLowerCase()}`
				// 			: `${asPath}/${departmentName.trim().toLowerCase()}`
				// 	}/${topicName.toLowerCase().replace(/ /g, `-`)}/${categoryName.toLowerCase().replace(/ /g, `-`)}/${
				// 		(ideaData as IIdeaData['idea']).idea_id
				// 	}`
				// );

				router.reload();
			} catch (error) {
				throw error;
			}
		}
	};

	return (
		<>
			<>
				<MetaTags title={`Edit Idea`} description="Idea idea" />
				<div className="flex flex-col gap-6">
					<form onSubmit={handleUpdateIdea} className="form-edit flex flex-col gap-6">
						<div className="flex flex-col gap-4">
							<div className="form-field">
								<Label size="text-normal">Title</Label>
								<Input
									value={formData?.idea_title}
									onChange={handleChange}
									name="idea_title"
									required={true}
									placeholder={"Input idea's title"}
									type="text"
								/>
								{formValidation &&
									(formValidation['ideaTitleValidation'] === 'success' ? (
										<div className="label-success">This title name is valid.</div>
									) : formValidation['ideaTitleValidation'] === 'error' ? (
										<div className="label-warning">Please input the title of idea.</div>
									) : null)}
							</div>
							{/* TODO: onChange & value */}
							<div className="form-field">
								<Label optional size="text-normal">
									Content
								</Label>
								<RichTextEditor
									value={formData?.idea_content}
									handleEditorChange={handleEditorChange}
									placeholder={`Input idea's content`}
								/>
							</div>
							<div id="select-category" className="form-field">
								<Label size="text-normal">Category</Label>
								<Select value={formData?.category_id} name="category_id" required onChange={handleChange}>
									<option disabled value={'disabled'}>
										{"Select idea's category"}
									</option>
									{categoryList ? (
										(categoryList as unknown as []).map((category) => (
											<option
												key={(category as ICategoryData['category']).category_id}
												value={(category as ICategoryData['category']).category_id}
											>
												{(category as ICategoryData['category']).category_name}
											</option>
										))
									) : (
										<ClipLoader />
									)}
								</Select>
								{formValidation &&
									(formValidation['ideaCategoryValidation'] === 'error' ? (
										<div className="label-warning">Please select category for idea.</div>
									) : null)}
							</div>

							<div className="form-field">
								<Label optional size="text-normal">
									Attach Document
								</Label>
								<AttachmentUploader
									idea_title={(ideaData as IIdeaData['idea']).idea_title}
									account_id={(ideaData as IIdeaData['idea']).account_id}
									value={formData?.idea_file_url}
									fileUpdate={fileUpdate}
									moreOptions={{ department_name: departmentName, topic_id: topicId }}
								/>
							</div>

							<Button
								disabled={!isFormValidated && !hasFormDataChanged}
								icon={true}
								className={`${
									isFormValidated && hasFormDataChanged ? `btn-primary` : `btn-disabled`
								}  self-start sm:self-stretch`}
							>
								<Icon name="Save" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
								Save changes
							</Button>
						</div>
					</form>
				</div>
			</>
		</>
	);
};
