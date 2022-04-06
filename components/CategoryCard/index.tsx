/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { Button } from 'components/Button';
import { EditCategoryModal } from 'components/Form/form';
import { Icon } from 'components/Icon';
import Modal from 'components/Modal';
import { deleteCategory } from 'pages/api/category';
import { ICategoryData } from 'lib/interfaces';

export const CategoryCard = ({ category }: ICategoryData) => {
	const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
	const { category_id, category_name, category_description } = category;
	const router = useRouter();
	const { asPath } = useRouter();
	const handleShowEditCategoryModal = useCallback(() => {
		setShowEditCategoryModal(!showEditCategoryModal);
	}, [showEditCategoryModal]);

	const handleCloseEditCategoryModal = useCallback(() => {
		setShowEditCategoryModal(false);
	}, []);

	const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
	const handleShowDeleteCategory = useCallback(() => {
		setShowConfirmCategoryModal(false);
		setShowDeleteCategoryModal(!showDeleteCategoryModal);
	}, [showDeleteCategoryModal]);

	const handleCloseDeleteModal = useCallback(() => {
		setShowDeleteCategoryModal(false);
	}, []);

	const [showConfirmCategoryModal, setShowConfirmCategoryModal] = useState(false);
	const handleConfirmModal = useCallback(() => {
		setShowConfirmCategoryModal(!showConfirmCategoryModal);
	}, [showConfirmCategoryModal]);

	const handleCloseConfirmModal = useCallback(() => {
		setShowConfirmCategoryModal(false);
		setShowDeleteCategoryModal(false);
	}, []);
	const handleDeleteCategory = async () => {
		if ((category.ideas as unknown as []).length === 0) {
			if (category.ideas?.length !== 0) {
				handleConfirmModal();
			} else {
				await deleteCategory(category_id, category_name);
				router.reload();
			}
		} else handleConfirmModal();
	};

	return (
		<tr className="category-card">
			<div className="category-card__info-wrapper">
				<Link href={`${asPath}/${category.category_name.toLowerCase().replace(/ /g, `-`)}`} passHref>
					<a>
						<div className="category-card__info">
							<td>
								<p className="text-subtitle font-semi-bold">{category_name}</p>
							</td>
							<td>
								<span className="flex items-center gap-1 card-info">
									<Icon size="16" name="File" />
									<p>
										{(category.ideas as unknown as []).length > 1
											? `${(category.ideas as unknown as []).length} ideas available `
											: `${(category.ideas as unknown as []).length} ideas available`}
									</p>
								</span>
							</td>
							<td>
								<span className="flex items-center gap-1 card-info">
									<Icon size="16" name="Info" />
									<p>{category_description}</p>
								</span>
							</td>
						</div>
					</a>
				</Link>
				<div className="category-card__action">
					<td>
						<div className="flex flex-1 justify-between lg:justify-start lg:gap-4">
							<Button onClick={handleShowEditCategoryModal} icon className="btn-secondary">
								<Icon name="Edit" size="16" />
								Edit
							</Button>
							{showEditCategoryModal && (
								<Modal onCancel={handleCloseEditCategoryModal} headerText={`Edit ${category.category_name}`}>
									<EditCategoryModal categoryData={category} />
								</Modal>
							)}

							<Button onClick={handleShowDeleteCategory} icon className="btn-primary">
								<Icon name="Trash" size="16" />
								Delete
							</Button>
							{showDeleteCategoryModal && (
								<Modal onCancel={handleCloseDeleteModal}>
									<div className="flex flex-col gap-6 justify-center">
										<p>
											Are you sure you want to delete this <span className="font-semi-bold">{category_name}</span>?
										</p>
										<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
											{/*TODO: Edit delete button box-shadow*/}
											<Button onClick={handleDeleteCategory} className="btn-danger w-full">
												Delete it
											</Button>
											{showConfirmCategoryModal && (
												<Modal onCancel={handleCloseConfirmModal}>
													<div className="flex flex-col gap-6 justify-center">
														<p>
															Please remove all ideas inside <span className="font-semi-bold">{category_name}</span>{' '}
															before deleting it!
														</p>
														<div className="flex flex-row flex-auto gap-6 relative overflow-hidden">
															{/*TODO: Edit delete button box-shadow*/}
															<Button onClick={handleCloseConfirmModal} className="btn-success w-full">
																Ok, got it!{' '}
															</Button>
														</div>
													</div>
												</Modal>
											)}
											<Button onClick={handleCloseDeleteModal} className="btn-secondary  w-full">
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
