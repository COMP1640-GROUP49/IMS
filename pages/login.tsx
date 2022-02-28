import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { Logo } from 'components/Logo';
import supabase from 'utils/supabase';
import { loginAccount } from './api/auth';

const Login: NextPage = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [hasError, setHasError] = useState(false);

	const router = useRouter();

	useEffect(() => {
		// const getData = async () => {
		// 	try {
		// 		const { data } = await supabase.from('accounts').select();
		// 		console.log(data);
		// 	} catch (error) {
		// 		console.log(error);
		// 	}
		// };
		// void getData();
	}, []);

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
			await router.push(`/admin`);
		} catch (error) {
			await router.push(`/`);
			setHasError(true);
		}
	};

	return (
		<div className="p-6 flex flex-wrap gap-6 justify-center items-center h-screen">
			<form
				className="flex flex-1 flex-wrap gap-6 flex-col lg:flex-row lg:justify-center items-center"
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

					<Button icon={true} className={'md:self-center lg:self-center'}>
						<Icon name="LogIn" size="16" color="white" />
						Log In
					</Button>
				</div>
			</form>
		</div>
	);
};

export default Login;
