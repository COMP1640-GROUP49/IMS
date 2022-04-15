/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useContext, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Button } from 'components/Button';
import { CategoryList } from 'components/CategoryList';
import { EditIdeaModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import IdeaDetail from 'components/IdeaDetail';
import { MoreMenu } from 'components/Menu';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import { UserContext } from 'components/PrivateRoute';
import { getCategoriesListByTopicId } from 'pages/api/category';
import { deleteIdea, getIdeaById } from 'pages/api/idea';
import { getTopicByName } from 'pages/api/topic';
import { ICategoryData, IIdeaData, ITopicData } from 'lib/interfaces';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const slug = context.params!['page'];
	const { topicData } = await getTopicByName(slug as string);

	let data;
	if (topicData) {
		const { data: categoryList } = await getCategoriesListByTopicId(
			(topicData as unknown as ITopicData['topic']).topic_id as unknown as string
		);
		data = categoryList;
	} else {
		const { ideaData } = await getIdeaById(slug as string);
		data = ideaData;
	}

	return {
		props: {
			slug,
			data,
		},
	};
};

const Slug1: NextPage = (props) => {
	const user = useContext(UserContext);
	const { slug }: any = props;
	const { data }: any = props;
	console.log('🚀 ~ file: index.tsx ~ line 51 ~ data', data);
	console.log('🚀 ~ file: index.tsx ~ line 52 ~ data', data);
	const categories = data as ICategoryData['category'];
	const idea = data as IIdeaData['idea'];
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const { asPath } = useRouter();

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
	const router = useRouter();
	const handleDeleteIdeaModal = async () => {
		await deleteIdea(idea.idea_id, idea.idea_title, departmentName as string, topicId as string, idea.account_id);
		await router.replace(asPath.replace(idea.idea_id.toLowerCase(), ''));
	};

	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteIdeaModal(false);
	}, []);

	return (
		<>
			<MetaTags title="IMS" />
			<Header />
			{+user?.user_metadata?.role === 1 ? (
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
						<div className="flex flex-col gap-2"></div>
					</div>
					<CategoryList categories={categories} />
				</main>
			) : +user?.user_metadata?.role === 3 ? (
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
							<p>{categories?.category_name}</p>
						</div>
						<div className="flex justify-between items-center">
							<h1>{idea.idea_title}</h1>

							{user && idea.account_id === user.id && (
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
							<EditIdeaModal duplicate={true} ideaData={idea} />
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
			) : (
				<ClipLoader />
			)}
		</>
	);
};
export default Slug1;
