/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import AvatarUploader from 'components/AvatarUploader';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { MetaTags } from 'components/MetaTags';
import { CheckEmailExisted, updateUserAvatar, uploadAvatar } from 'pages/api/admin';
import { IUserData } from 'pages/api/auth';
import { updateProfile } from 'pages/api/user';
import { scrollToElement } from 'utils/scrollAnimate';

export const EditProfile = ({ data }: any) => {
	const router = useRouter();
	const [formData, setFormData] = useState<IUserData>(data as IUserData);
	console.log('🚀 ~ file: form.tsx ~ line 18 ~ EditProfile ~ formData', formData);
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
			<MetaTags
				title={`Edit ${(data as IUserData).user_metadata?.full_name as string}'s Profile`}
				description="Update user profile"
			/>
			<main className="below-navigation-bar form-container flex flex-col gap-6 p-6">
				<h1>{`Edit ${(data as IUserData)?.user_metadata?.full_name as string}'s Profile`}</h1>
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
