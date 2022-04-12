/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback, useContext, useState } from 'react';
import { Button } from 'components/Button';
import { EditIdeaModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import IdeaDetail from 'components/IdeaDetail';
import { MoreMenu } from 'components/Menu';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import { UserContext } from 'components/PrivateRoute';
import { getCategoryById } from 'pages/api/category';
import { getDepartmentNameFromTopicId } from 'pages/api/department';
import { deleteIdea, getIdeaById } from 'pages/api/idea';
import { getTopicIdByCategoryId } from 'pages/api/topic';
import { getAccountByAccountId } from 'pages/api/user';
import { ICategoryData, IIdeaData, IIdeasProps } from 'lib/interfaces';

interface IParams extends ParsedUrlQuery {
	category_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { idea_id: slug } = params as IParams;
	const { ideaData } = await getIdeaById(slug as string);
	const { userData } = await getAccountByAccountId(
		(ideaData as unknown as IIdeaData['idea']).account_id as unknown as string
	);
	const { categoryData } = await getCategoryById(
		(ideaData as unknown as IIdeaData['idea']).category_id as unknown as string
	);

	const { topicId } = await getTopicIdByCategoryId((categoryData as unknown as ICategoryData['category']).category_id);

	const { department_name: departmentName } = await getDepartmentNameFromTopicId(topicId);
	return {
		props: {
			categoryData,
			userData,
			slug,
			ideaData,
			topicId,
			departmentName,
		},
	};
};

const IdeaDetailPage: NextPage<IIdeasProps> = (props) => {
	const { asPath } = useRouter();
	const { slug }: any = props;

	const { ideaData }: any = props;
	const idea = ideaData as IIdeaData['idea'];

	const { categoryData }: any = props;
	const category = categoryData as ICategoryData['category'];

	const { topicId }: any = props;
	const { departmentName }: any = props;

	const [showMoreMenu, setShowMoreMenu] = useState(false);

	const handleCloseMoreMenu = () => {
		setShowMoreMenu(false);
	};

	const handleShowMoreMenu = () => {
		setShowMoreMenu(!showMoreMenu);
	};

	const [showEditIdeaModal, setShowEditIdeaModal] = useState(false);
	const handleShowEditIdeaModal = useCallback(() => {
		setShowEditIdeaModal(true);
	}, []);

	const handleCloseEditIdeaModal = useCallback(() => {
		setShowEditIdeaModal(false);
	}, []);

	const [showDeleteIdeaModal, setShowDeleteIdeaModal] = useState(false);

	const handleShowDeleteIdeaModal = useCallback(() => {
		// setShowConfirmIdeaModal(false);
		setShowDeleteIdeaModal(!showDeleteIdeaModal);
	}, [showDeleteIdeaModal]);

	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteIdeaModal(false);
	}, []);

	const router = useRouter();
	const handleDeleteIdeaModal = async () => {
		await deleteIdea(idea.idea_id, idea.idea_title, departmentName as string, topicId as string, idea.account_id);
		await router.replace(asPath.replace(idea.idea_id.toLowerCase(), ''));
	};

	const currentUser = useContext(UserContext);

	return (
		<>
			<>
				<MetaTags title={``} description={`Ideas in category`} />
				<Header />
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex flex-col gap-3 lg:justify-between">
						<Link href={asPath.replace((slug as string).toLowerCase(), '')}>
							<a className="back-link">
								<Icon size="24" name="RotateCcw" />
								Back to ideas list
							</a>
						</Link>
						<div className="flex gap-2 items-center">
							<Icon size="16" name="Hash" />
							<p>{category?.category_name}</p>
						</div>
						<div className="flex justify-between items-center">
							<h1>{idea.idea_title}</h1>

							{currentUser && idea.account_id === currentUser.id && (
								<Button className="more-option relative" onClick={handleShowMoreMenu} icon>
									<Icon size="24" name="MoreHorizontal" />
									{showMoreMenu && (
										<MoreMenu onCancel={handleCloseMoreMenu}>
											<div className="flex flex-col gap 2 items-start">
												<Button onClick={handleShowEditIdeaModal} className="btn-menu">
													Edit idea
												</Button>

												<Button onClick={handleShowDeleteIdeaModal} className="btn-menu">
													Delete idea
												</Button>
											</div>
										</MoreMenu>
									)}
								</Button>
							)}
						</div>
					</div>
					<IdeaDetail idea={idea} />
					{showEditIdeaModal && (
						<Modal onCancel={handleCloseEditIdeaModal} headerText={`Edit ${idea.idea_title}`}>
							<EditIdeaModal duplicate={true} topic_id={topicId as string} ideaData={idea} />
						</Modal>
					)}

					{showDeleteIdeaModal && (
						<Modal onCancel={handleCloseDeleteModal}>
							<div className="flex flex-col gap-6 justify-center">
								<p>
									Are you sure you want to delete this <span className="font-semi-bold">{idea.idea_title}</span>?
								</p>
								<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
									{/*TODO: Edit delete button box-shadow*/}
									<Button onClick={handleDeleteIdeaModal} className="btn-danger w-full">
										Delete it
									</Button>
									<Button onClick={handleCloseDeleteModal} className="btn-secondary  w-full">
										Cancel
									</Button>
								</div>
							</div>
						</Modal>
					)}
				</main>
			</>
		</>
	);
};

export default IdeaDetailPage;
