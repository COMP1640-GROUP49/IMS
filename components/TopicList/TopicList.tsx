import { ClipLoader } from 'react-spinners';
import { TopicCard } from '../TopicCard/TopicCard';

export const TopicList = ({ topics }: any) => {
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
