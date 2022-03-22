/* eslint-disable @typescript-eslint/no-misused-promises */
import { useContext } from 'react';
import { EditProfile } from 'components/Form/form';
import { Header } from 'components/Header';
import { MetaTags } from 'components/MetaTags';
import { UserContext } from 'components/PrivateRoute';

const EditProfilePage = () => {
	const user = useContext(UserContext);
	return (
		<>
			<MetaTags title={`Edit @${user?.user_metadata?.username as string}'s Profile`} />
			<Header />
			<EditProfile data={user} />
			{console.log(user)}
		</>
	);
};
export default EditProfilePage;
