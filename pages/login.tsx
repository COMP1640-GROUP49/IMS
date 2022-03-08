import { NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { Logo } from 'components/Logo';
import { useUserData } from 'lib/hooks';
import { loginAccount, loginWithGoogle } from './api/auth';

const Login: NextPage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [hasError, setHasError] = useState(false);
	const user = useUserData();

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
			await loginAccount({ username, password });
		} catch (error) {
			setHasError(true);
		}
	};

	const handleLoginWithGoogle = async () => {
		await loginWithGoogle();
	};

	useEffect(() => {
		try {
			if (user) {
				switch (user?.user_metadata?.role) {
					case 0:
						void router.push('/admin');
						break;
					default:
						void router.push('/admin');
						break;
				}
			}
		} catch (error) {}
	}, [user, router]);

	return (
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
					{hasError ? <div className="label-error">Username or password is incorrect</div> : <></>}
					<div className="flex flex-col gap-2">
						<Button type="submit" icon={true} className={'btn-primary'}>
							<Icon name="LogIn" size="16" color="white" />
							Log In
						</Button>
						<p className="divider self-stretch text-sonic-silver">
							<span>or</span>
						</p>
						<Button onClick={handleLoginWithGoogle} type="button" icon={true} className={'btn-google '}>
							<Image priority src="/google.svg" width="16" height="16" alt="img-logo" />
							Continue with Google
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};

export default Login;
