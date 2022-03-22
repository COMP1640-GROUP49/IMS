/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetStaticPaths, GetStaticProps } from 'next';
import React, { FormEvent, Fragment, useContext, useEffect, useState } from 'react';
import AvatarUploader from 'components/AvatarUploader';
import { Button } from 'components/Button';
import { EditProfile } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { Input } from 'components/Input';
import { Label } from 'components/Label';
import { MetaTags } from 'components/MetaTags';
import { UserContext } from 'components/PrivateRoute';
import { CheckEmailExisted, getAccountData, getUsersList, uploadAvatar } from 'pages/api/admin';
import { IAccountData, IParams } from 'lib/interfaces';

// export const getStaticPaths: GetStaticPaths = async () => {
// 	const { data } = await getUsersList();
// 	const paths = data?.map((account: IAccountData) => {
// 		return {
// 			params: {
// 				username: account?.username,
// 			},
// 		};
// 	});
// 	return {
// 		paths: paths as [],
// 		fallback: false,
// 	};
// };

// export const getStaticProps: GetStaticProps = async ({ params }) => {
// 	const { username } = params as IParams;
// 	const data = await getAccountData('', username);
// 	return {
// 		props: {
// 			data,
// 		},
// 		revalidate: 10,
// 	};
// };

const EditProfilePage = () => {
	const user = useContext(UserContext);
	return (
		<>
			<MetaTags title={`Edit ${user?.user_metadata?.full_name as string}'s Profile`} />
			<Header />
			<EditProfile data={user} />
			{console.log(user)}
		</>
	);
};
export default EditProfilePage;
