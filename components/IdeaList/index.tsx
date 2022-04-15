/* eslint-disable @typescript-eslint/no-misused-promises */
import { useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { IdeaCard } from 'components/IdeaCard';
import { Select } from 'components/Select';
import { getIdeasListByCategoryId } from 'pages/api/idea';
import { getAllIdeasByTopicId, getTopicIdByCategoryId } from 'pages/api/topic';
import { IIdeasProps } from 'lib/interfaces';

export const IdeaList = ({ category_id, topic_id, ideas: ideaList }: any) => {
	const [idea, setIdea] = useState<IIdeasProps>();

	const handleChangeSortOption = async (event: React.ChangeEvent<HTMLSelectElement>) => {
		const limit = 99999;
		switch (event.target.value) {
			case 'most-popular': {
				if (topic_id) {
					const { ideaList } = await getAllIdeasByTopicId(topic_id as string);
					setIdea(ideaList as unknown as IIdeasProps);
					break;
				} else {
					const { data } = await getIdeasListByCategoryId(category_id as string);
					setIdea(data as unknown as IIdeasProps);
					break;
				}
			}
			case 'most-view': {
				if (topic_id) {
					const { ideaList } = await getAllIdeasByTopicId(topic_id as string, limit, 'idea_view', false);
					setIdea(ideaList as unknown as IIdeasProps);
					break;
				} else {
					const { data } = await getIdeasListByCategoryId(category_id as string, limit, 'idea_view', false);
					setIdea(data as unknown as IIdeasProps);
					break;
				}
			}
			case 'newest': {
				if (topic_id) {
					const { ideaList } = await getAllIdeasByTopicId(topic_id as string, limit, 'idea_created', false);
					setIdea(ideaList as unknown as IIdeasProps);
					break;
				} else {
					const { data } = await getIdeasListByCategoryId(category_id as string, limit, 'idea_created', false);
					setIdea(data as unknown as IIdeasProps);
					break;
				}
			}
			case 'oldest': {
				if (topic_id) {
					const { ideaList } = await getAllIdeasByTopicId(topic_id as string, limit, 'idea_created', true);
					setIdea(ideaList as unknown as IIdeasProps);
					break;
				} else {
					const { data } = await getIdeasListByCategoryId(category_id as string, limit, 'idea_created', true);
					setIdea(data as unknown as IIdeasProps);
					break;
				}
			}
			case 'latest-updated': {
				if (topic_id) {
					const { ideaList } = await getAllIdeasByTopicId(topic_id as string, limit, 'idea_updated', false);
					setIdea(ideaList as unknown as IIdeasProps);
					break;
				} else {
					const { data } = await getIdeasListByCategoryId(category_id as string, limit, 'idea_updated', false);
					setIdea(data as unknown as IIdeasProps);
					break;
				}
			}
			default: {
				if (topic_id) {
					const { ideaList } = await getAllIdeasByTopicId(topic_id as string);
					setIdea(ideaList as unknown as IIdeasProps);
					break;
				} else {
					const { data } = await getIdeasListByCategoryId(category_id as string);
					setIdea(data as unknown as IIdeasProps);
					break;
				}
			}
		}
	};
	useEffect(() => {
		!idea && setIdea(ideaList as IIdeasProps);
	}, [idea, ideaList, category_id]);

	return (
		<div className="flex flex-col gap-6 user-list">
			<div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end form-edit">
				<p className="text-body font-semi-bold users-list">List of ideas</p>
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
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<tbody>
						{idea ? (
							(idea as unknown as []).map((idea) => <IdeaCard key={idea['idea_id']} idea={idea} />)
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
