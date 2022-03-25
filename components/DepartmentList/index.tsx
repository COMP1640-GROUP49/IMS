import { ClipLoader } from 'react-spinners';
import DepartmentCard from 'components/DepartmentCard';

export const DepartmentList = ({ department }: any) => {
	return (
		<div className="flex flex-col gap-6 user-list shadow-0">
			<div>
				<p className="text-body font-semi-bold users-list">List of department</p>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<tbody>
						{department ? (
							(department as []).map((departments) => (
								<DepartmentCard key={departments['department_id']} department={departments} />
							))
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
