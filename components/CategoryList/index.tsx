import Link from 'next/link';
import { useRouter } from 'next/router';
import { ClipLoader } from 'react-spinners';
import { CategoryCard } from 'components/CategoryCard';

export const CategoryList = ({ categories }: any) => {
	const { asPath } = useRouter();

	return (
		<div className="flex flex-col gap-6 user-list">
			<div className="flex justify-between">
				<p className="text-body font-semi-bold users-list">List of categories</p>
				<Link href={`${asPath}/all-ideas`}>
					<a>
						<p className="font-semi-bold text-sonic-silver hover:text-black">View all ideas</p>
					</a>
				</Link>
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
