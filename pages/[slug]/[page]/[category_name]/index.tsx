/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetServerSideProps, NextPage } from 'next';
import { useContext } from 'react';
import { ClipLoader } from 'react-spinners';
import { CategoryList } from 'components/CategoryList';
import { Header } from 'components/Header';
import { MetaTags } from 'components/MetaTags';
import { UserContext } from 'components/PrivateRoute';
import { getAccountData } from 'pages/api/admin';
import { getCategoriesListByTopicId } from 'pages/api/category';
import { getDepartmentIdByName } from 'pages/api/department';
import { getTopicByName } from 'pages/api/topic';
import { ICategoryData, ITopicData } from 'lib/interfaces';

const Category: NextPage = (props) => {
	const user = useContext(UserContext);
	return <></>;
};
export default Category;
