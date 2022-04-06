import { ClipLoader } from 'react-spinners';
import { CategoryCard } from 'components/CategoryCard';

export const CategoryList = ({ categories }: any) => {
	return (
		<div className="flex flex-col gap-6 user-list">
			<div>
				<p className="text-body font-semi-bold users-list">List of categories</p>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<tbody>
						{categories ? (
							(categories as []).map((category) => <CategoryCard key={category['category_id']} category={category} />)
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
