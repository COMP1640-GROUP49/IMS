/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetStaticPaths, GetStaticProps } from 'next';
import React, { FormEvent, Fragment, useEffect, useState } from 'react';
import AvatarUploader from 'components/AvatarUploader';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { CheckEmailExisted, getAccountData, getUsersList, uploadAvatar } from 'pages/api/admin';
import { IAccountData, IParams } from 'lib/interfaces';

export const getStaticPaths: GetStaticPaths = async () => {
	const { data } = await getUsersList();
	const paths = data?.map((account: IAccountData) => {
		return {
			params: {
				username: account?.username,
			},
		};
	});
	return {
		paths: paths as [],
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const { username } = params as IParams;
	const data = await getAccountData('', username);
	return {
		props: {
			data,
		},
		revalidate: 10,
	};
};

const UserEdit = ({ data }: any) => {
	const [isFormValidated, setIsFormValidated] = useState(false);
	const [userData, setUserData] = useState(data as IAccountData['account']);
	const [formValidation, setFormValidation] = useState<IFormValidation>();
	const [avatar, setAvatar] = useState<File>();
	const { username } = data as IAccountData['account'];

	interface IFormValidation {
		usernameValidation: string;
		passwordValidation: string;
		emailValidation: string;
		roleValidation: string;
		departmentValidation: string;
		phoneValidation: string;
	}

	const handleEditUser = async (event: React.FormEvent<HTMLFormElement> | HTMLFormElement) => {
		(event as FormEvent<HTMLFormElement>).preventDefault();
		await fileUpload();
	};
	const fileUpload = async () => {
		if (avatar && userData.username) {
			try {
				const avatarUrl = await uploadAvatar(avatar, userData.username);
				userData.username = avatarUrl;
			} catch (error) {
				throw new Error('Avatar upload error!');
			}
		} else {
			userData.username = '';
		}
	};
	const fileUpdate = (data: File) => {
		setAvatar(data);
		return data;
	};

	const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
		setUserData({ ...userData, [event.target.name]: event.target.value.trim() });
		// email validation
		if (event.target.name === 'account_email') {
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
		if (event.target.name === 'account_phone_number') {
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
	};
	useEffect(() => {
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

	return (
		<Fragment>
			<Header />
			<div className="below-navigation-bar form-container flex flex-col gap-6 p-6">
				<h1>Edit {username.toUpperCase()} Profile</h1>
				<form onSubmit={handleEditUser} className="flex flex-col gap-6">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label size="text-normal">Email</Label>
							<Input
								value={userData.account_email}
								name="account_email"
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
							<Label size="text-normal">Full name</Label>
							<Input
								value={userData.account_full_name}
								name="account_full_name"
								onChange={handleChange}
								required={false}
								placeholder={"Input account's full name"}
								type="text"
							/>
						</div>

						<div className="flex flex-col gap-2">
							<Label size="text-normal">Address</Label>
							<Input
								value={userData.account_address}
								name="account_address"
								onChange={handleChange}
								required={false}
								placeholder={"Input account's address"}
								type="text"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label size="text-normal">Phone number</Label>
							<Input
								value={userData.account_phone_number}
								name="account_phone_number"
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
						<Icon name="Edit" size="16" color={`${isFormValidated ? `white` : `#c6c6c6`}`} />
						Edit user
					</Button>
				</form>
			</div>
		</Fragment>
	);
};
export default UserEdit;
