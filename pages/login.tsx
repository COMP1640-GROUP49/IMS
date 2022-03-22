/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter, withRouter } from 'next/router';
import React, { useState } from 'react';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { Logo } from 'components/Logo';
import { MetaTags } from 'components/MetaTags';
import { loginAccount, loginWithGoogle } from 'pages/api/auth';

const Login: NextPage = (props: any) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [hasError, setHasError] = useState(false);

	const router = useRouter();

	const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setUsername(event.target.value);
		setHasError(false);
	};
	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
		setHasError(false);
	};

	type LoginProps = {
		username: string;
		password: string;
	};

	const handleLogin = async (event: React.FormEvent, { username, password }: LoginProps) => {
		event.preventDefault();
		try {
			const data = await loginAccount({ username, password });
			console.log('🚀 ~ file: login.tsx ~ line 40 ~ handleLogin ~ data', data);

			if (data && data['error']) {
				setHasError(true);
			} else {
				setHasError(false);
				if (data?.user) {
					switch (data?.user?.user_metadata?.role) {
						case '0':
							void router.push('/admin');
							break;
						default:
							void router.push('/');
					}
				}
			}
		} catch (error) {
			setHasError(true);
		}
	};

	const handleLoginWithGoogle = async () => {
		await loginWithGoogle();
	};

	return (
		<main>
			<MetaTags title="Login" description="Please log in into IMS" />
			<div className="p-6 flex gap-6 justify-center items-center h-screen md:px-40">
				<form
					className="flex flex-1 gap-6 flex-col lg:flex-row lg:justify-center items-center"
					onSubmit={(event) => handleLogin(event, { username, password })}
				>
					<div className="flex flex-1 justify-center lg:max-w-lg">
						<Logo width="128" height="128" />
					</div>
					<div className="flex flex-1 flex-col gap-6 self-stretch justify-center lg:justify-start lg:max-w-lg ">
						<div className="flex flex-col gap-2">
							<Label size="text-subtitle">Username</Label>
							<Input
								value={username}
								onChange={handleUsernameChange}
								required={true}
								placeholder="Input your username"
								type="text"
							></Input>
						</div>
						<div className="flex flex-col gap-2">
							<Label size="text-subtitle">Password</Label>
							<Input
								value={password}
								onChange={handlePasswordChange}
								required={true}
								placeholder="Input your password"
								type="password"
							></Input>
						</div>
						{hasError ? <div className="label-error">Username or password is incorrect.</div> : <></>}
						<div className="flex flex-col gap-2">
							<Button type="submit" icon={true} className={'btn-primary'}>
								<Icon name="LogIn" size="16" color="white" />
								Log In
							</Button>
							<p className="divider self-stretch text-sonic-silver">
								<span>or</span>
							</p>
							{props?.router?.query?.error === 'google account error' && (
								<div className="label-error">This Google account is not valid. Please try another one.</div>
							)}
							<Button onClick={handleLoginWithGoogle} type="button" icon={true} className={'btn-google '}>
								<Image priority={false} src="/google.svg" width="16" height="16" alt="img-logo" />
								Continue with Google
							</Button>
						</div>
					</div>
				</form>
			</div>
		</main>
	);
};

export default withRouter(Login);
