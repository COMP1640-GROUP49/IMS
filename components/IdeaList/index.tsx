/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { IdeaCard } from 'components/IdeaCard';
import { Select } from 'components/Select';
import { getCategoriesListByTopicId } from 'pages/api/category';
import { ICategoriesProps, ICategoryData } from 'lib/interfaces';

type IdeaProps = {
	topic_id?: string;
	ideas: any;
	handleSortData: (sortBy: string, topic_id?: string) => Promise<void>;
	handleChangeCategorySort?: (category_id: string) => Promise<void>;
	sortOptions?: any;
};

export const IdeaList = ({ topic_id, ideas, handleSortData, handleChangeCategorySort, sortOptions }: IdeaProps) => {
	const handleChangeSortOption = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		await handleSortData(event.target.value, topic_id);
	};

	const handleChangeCategoryOption = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		handleChangeCategorySort && (await handleChangeCategorySort(event.target.value));
	};

	const [categoryList, setCategoryList] = useState<ICategoriesProps>();

	useEffect(() => {
		const getAdditionalData = async () => {
			const { data } = await getCategoriesListByTopicId(topic_id as string);
			setCategoryList(data as unknown as ICategoriesProps);
		};
		void getAdditionalData();
	}, [topic_id]);

	return (
		<div className="flex flex-col gap-6 user-list">
			<div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center form-edit">
				<p className="text-body font-semi-bold users-list">List of ideas</p>
				<div className="flex flex-col lg:flex-row gap-6 ">
					{handleChangeCategorySort && (
						<div className="flex flex-col lg:flex-row items-stretch gap-2 lg:items-center">
							<span className="font-semi-bold">Categories</span>
							<Select
								defaultValue={'all-categories'}
								name="sort-idea-by-category"
								required
								onChange={handleChangeCategoryOption}
							>
								<option value={'all-categories'}>{'All categories'}</option>
								{categoryList ? (
									(categoryList as unknown as []).map((category) => (
										<option
											key={(category as ICategoryData['category']).category_id}
											value={(category as ICategoryData['category']).category_id}
										>
											{(category as ICategoryData['category']).category_name}
										</option>
									))
								) : (
									<ClipLoader />
								)}
							</Select>
						</div>
					)}
					<div className="flex flex-col lg:flex-row items-stretch gap-2 lg:items-center">
						<span className="font-semi-bold">Sort by</span>
						<Select
							name="idea-list-sort"
							defaultValue={'most-popular'}
							required={false}
							onChange={handleChangeSortOption}
						>
							<option value={'most-popular'}>{'Most Popular'}</option>
							<option value={'most-view'}>{'Most View'}</option>
							<option value={'newest'}>{'Newest '}</option>
							<option value={'oldest'}>{'Oldest '}</option>
							<option value={'latest-updated'}>{'Latest Updated '}</option>
						</Select>
					</div>
				</div>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<tbody>
						{ideas ? (
							(ideas as unknown as []).map((idea) => <IdeaCard key={idea['idea_id']} idea={idea} />)
						) : (
							<tr>
								<td rowSpan={7}>
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
