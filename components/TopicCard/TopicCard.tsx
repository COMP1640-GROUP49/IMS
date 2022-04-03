/* eslint-disable @typescript-eslint/no-misused-promises */
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Button } from 'components/Button';
import { EditTopicModal } from 'components/Form/form';
import { Icon } from 'components/Icon';
import Modal from 'components/Modal';
import { deleteTopic } from 'pages/api/topic';
import { ITopicData } from 'lib/interfaces';

export const TopicCard = ({ topic }: ITopicData) => {
	const router = useRouter();
	const { asPath } = useRouter();
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
				<Link href={`${asPath}/${topic.topic_name.toLowerCase().replace(/ /g, `-`)}`} passHref>
					<a className="topic-card__info">
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
					</a>
				</Link>
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
