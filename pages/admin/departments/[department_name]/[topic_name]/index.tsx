/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'components/Button';
import { CategoriesList } from 'components/CategoriesList';
import { CareateCategoryModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import Pagination from 'components/Pagination';
import { getCategoriesListByTopicsId } from 'pages/api/category';
import { getTopicByName } from 'pages/api/topic';
import { ICategoriesProps, ICategoryData } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';

interface IParams extends ParsedUrlQuery {
	topic_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { topic_name } = params as IParams;
	const { topic_id } = await getTopicByName(topic_name as string);
	const { data } = await getCategoriesListByTopicsId(topic_id as string);

	console.log(data);
	return {
		props: {
			topic_id,
			topic_name,
			data,
		},
	};
};
interface ITopicProps {
	topic_id: string;
	topic_name: string;
}

const TopicsManagementPage: NextPage<ICategoriesProps, ITopicProps> = (props) => {
	const { data: categories } = props;
	const { topic_id }: any = props;
	const { topic_name }: any = props;
	const { asPath } = useRouter();
	const limit = 5;
	const [currentItems, setCurrentItems] = useState<ICategoryData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	useEffect(() => {
		const endOffset = itemOffset + limit;
		setCurrentItems(categories.slice(itemOffset, endOffset));
		setPageCount(Math.ceil(categories.length / limit));
	}, [itemOffset, categories, limit]);

	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % categories.length;
		setItemOffset(newOffset);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};

	const [showCreateCategoriesModal, setShowCreateCategoriesModal] = useState(false);
	const handleShowCreateCategoryModal = useCallback(() => {
		setShowCreateCategoriesModal(!showCreateCategoriesModal);
	}, [showCreateCategoriesModal]);
	const handleCloseEditDepartmentModal = useCallback(() => {
		setShowCreateCategoriesModal(false);
	}, []);

	return (
		<>
			<MetaTags title="Departments Management" description="Manage departments of IMS" />
			<Header />
			<main className="body-container flex flex-col gap-6 below-navigation-bar">
				<div className="flex flex-col gap-6 lg:flex-row  lg:justify-between">
					<div className="flex flex-col gap-2">
						<Link href={asPath.replace((topic_name as string).toLowerCase(), '')}>
							<a className="back-link">
								<Icon size="24" name="RotateCcw" />
								Back to categories list
							</a>
						</Link>
						<h1>{`${topic_name as string} Categories`}</h1>
					</div>
					<Button onClick={handleShowCreateCategoryModal} icon className="btn-primary self-start sm:self-stretch">
						<Icon name="PlusSquare" size="16" />
						Create new departments
					</Button>
					{showCreateCategoriesModal && (
						<Modal onCancel={handleCloseEditDepartmentModal} headerText={`Create New Department`}>
							<CareateCategoryModal topic_id={topic_id as string} />
						</Modal>
					)}
				</div>
				<CategoriesList categories={currentItems} />
				<Pagination
					items={categories as []}
					currentItems={currentItems as []}
					itemOffset={itemOffset}
					pageCount={pageCount}
					handlePaginationClick={handlePaginationClick}
					handlePageClick={handlePageClick}
				/>
			</main>
		</>
	);
};
export default TopicsManagementPage;
