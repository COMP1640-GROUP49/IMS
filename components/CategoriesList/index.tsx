import { ClipLoader } from 'react-spinners';
import { CategoriesCard } from 'components/CategoriesCard';

export const CategoriesList = ({ categories }: any) => {
	return (
		<div className="flex flex-col gap-6 user-list">
			<div>
				<p className="text-body font-semi-bold users-list">List of departments</p>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<tbody>
						{categories ? (
							(categories as []).map((category) => <CategoriesCard key={category['category_id']} category={category} />)
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
