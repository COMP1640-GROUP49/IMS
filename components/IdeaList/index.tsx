import { ClipLoader } from 'react-spinners';
import { IdeaCard } from 'components/IdeaCard';

export const IdeaList = ({ ideas }: any) => {
	return (
		<div className="flex flex-col gap-6 user-list">
			<div>
				<p className="text-body font-semi-bold users-list">List of ideas</p>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<tbody>
						{ideas ? (
							(ideas as []).map((idea) => <IdeaCard key={idea['idea_id']} idea={idea} />)
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
