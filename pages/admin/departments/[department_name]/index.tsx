/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Button } from 'components/Button';
import { CreateTopicModal, EditTopicModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import { getDepartmentByName } from 'pages/api/department';
import { deleteTopic, getTopicsListByDepartmentId } from 'pages/api/topic';
import { ITopicData, ITopicsProps } from 'lib/interfaces';

interface IParams extends ParsedUrlQuery {
	department_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { department_name } = params as IParams;
	const { department_id } = await getDepartmentByName(department_name as string);
	const { data } = await getTopicsListByDepartmentId(department_id as string);

	return {
		props: {
			department_id,
			department_name,
			data,
		},
	};
};

interface IDepartmentProps {
	department_id: string;
	department_name: string;
}

const DepartmentPage: NextPage<ITopicsProps, IDepartmentProps> = (props) => {
	const { data: topics } = props;
	let { department_name }: any = props;
	const { department_id }: any = props;

	if ((department_name as string).length === 2) {
		department_name = (department_name as string).toUpperCase();
	} else {
		department_name = (department_name as string).replace(
			(department_name as string)[0],
			`${(department_name as string)[0].toUpperCase()}`
		);
	}

	const { asPath } = useRouter();
	const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
	const handleCloseCreateTopicModal = useCallback(() => {
		setShowCreateTopicModal(false);
	}, []);

	const handleShowCreateTopicModal = useCallback(() => {
		setShowCreateTopicModal(!showCreateTopicModal);
	}, [showCreateTopicModal]);

	return (
		<>
			<MetaTags title={`${department_name as string} Department`} />
			<Header />
			<main className="body-container flex flex-col gap-6 below-navigation-bar">
				<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
					<div className="flex flex-col gap-2">
						<Link href={asPath.replace((department_name as string).toLowerCase(), '')}>
							<a className="back-link">
								<Icon size="24" name="RotateCcw" />
								Back to departments list
							</a>
						</Link>
						<h1>{`${department_name as string} Department`}</h1>
					</div>
					<Button
						onClick={handleShowCreateTopicModal}
						icon
						className="btn-primary  sm:self-stretch md:self-start lg:self-end"
					>
						<Icon size="16" name="FolderPlus" />
						Create new topic
					</Button>
					{showCreateTopicModal && (
						<Modal onCancel={handleCloseCreateTopicModal} headerText={`Create New Topic`}>
							<CreateTopicModal department_id={department_id as string} />
						</Modal>
					)}
				</div>
				<TopicList topics={topics} />
			</main>
		</>
	);
};

export default DepartmentPage;

const TopicList = ({ topics }: any) => {
	return (
		<div className="flex flex-col gap-6 topics-list">
			<div>
				<p className="text-body font-semi-bold users-list">List of topics</p>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<tbody>
						{topics ? (
							(topics as []).map((topic) => <TopicCard key={topic['topic_id']} topic={topic} />)
						) : (
							<tr>
								<td rowSpan={9}>
									<ClipLoader />
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

const TopicCard = ({ topic }: ITopicData) => {
	const router = useRouter();
	const [showEditTopicModal, setShowEditTopicModal] = useState(false);
	const handleCloseEditTopicModal = useCallback(() => {
		setShowEditTopicModal(false);
	}, []);

	const handleShowEditTopicModal = useCallback(() => {
		setShowEditTopicModal(!showEditTopicModal);
	}, [showEditTopicModal]);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const handleShowDeleteModal = useCallback(() => {
		setShowDeleteModal(!showDeleteModal);
	}, [showDeleteModal]);

	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteModal(false);
	}, []);

	const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
	const handleShowDeleteConfirmationModal = useCallback(async () => {
		if ((topic?.categories as unknown as []).length > 0) {
			setShowDeleteConfirmationModal(true);
		} else {
			await deleteTopic(topic?.topic_id, topic?.topic_name);
			router.reload();
		}
	}, [topic]);

	const handleCloseDeleteConfirmationModal = useCallback(() => {
		setShowDeleteModal(false);
		setShowDeleteConfirmationModal(false);
	}, []);

	return (
		<tr className="topic-card">
			<td>
				<p className="text-subtitle font-semi-bold">{topic.topic_name}</p>
			</td>
			<div className="topic-card__info-wrapper">
				<div className="topic-card__info">
					<td>
						<span className="flex items-center gap-1 card-info">
							<Icon size="16" name="Calendar" />
							<p>
								{moment(topic.topic_start_date).format('MMM DD, YYYY')} -{' '}
								{moment(topic.topic_first_closure_date).format('MMM DD, YYYY')} /{' '}
								{moment(topic.topic_final_closure_date).format('MMM DD, YYYY')}
							</p>
						</span>
					</td>
					<td>
						<span className="flex items-center gap-1 card-info">
							<Icon size="16" name="Grid" />
							<p>
								{(topic.categories as unknown as []).length > 1
									? `${(topic.categories as unknown as []).length} categories available`
									: `${(topic.categories as unknown as []).length} category available`}
							</p>
						</span>
					</td>
					<td>
						<span className="flex items-center gap-1 card-info">
							<Icon size="16" name="File" />
							<p>99 ideas available</p>
						</span>
					</td>
					<td>
						<span className="flex items-center gap-1 card-info">
							<Icon size="16" name="Info" />
							<p className={!topic.topic_description ? 'italic' : ''}>{topic.topic_description || `Blank`}</p>
						</span>
					</td>
				</div>
				<div className="topic-card__action">
					<td>
						<div className="flex flex-1 flex-wrap justify-between lg:justify-start lg:gap-4">
							<Button onClick={handleShowEditTopicModal} icon className="btn-secondary">
								<Icon name="Edit" size="16" />
								Edit
							</Button>
							{showEditTopicModal && (
								<Modal onCancel={handleCloseEditTopicModal} headerText={`Edit ${topic.topic_name} Topic`}>
									<EditTopicModal topicData={topic} />
								</Modal>
							)}

							<Button onClick={handleShowDeleteModal} icon className="btn-primary">
								<Icon name="Trash" size="16" />
								Delete
							</Button>
							{showDeleteModal && (
								<Modal onCancel={handleCloseDeleteModal}>
									<div className="flex flex-col gap-6 justify-center">
										<p>
											Are you sure you want to delete this topic{' '}
											<span className="font-semi-bold">{topic.topic_name}</span>?
										</p>
										<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
											{/*TODO: Edit delete button box-shadow*/}
											<Button onClick={handleShowDeleteConfirmationModal} className="btn-danger w-full">
												Delete it
											</Button>
											{showDeleteConfirmationModal && (
												<Modal onCancel={handleCloseDeleteConfirmationModal}>
													<div className="flex flex-col gap-6 justify-center">
														<p>
															Please remove all idea categories inside{' '}
															<span className="font-semi-bold">{topic.topic_name}</span> before deleting it!
														</p>
														<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
															{/*TODO: Edit delete button box-shadow*/}
															<Button onClick={handleCloseDeleteConfirmationModal} className="btn-success w-full">
																Ok, got it!{' '}
															</Button>
														</div>
													</div>
												</Modal>
											)}

											<Button onClick={handleCloseDeleteModal} className="btn-secondary w-full">
												Cancel
											</Button>
										</div>
									</div>
								</Modal>
							)}
						</div>
					</td>
				</div>
			</div>
		</tr>
	);
};
