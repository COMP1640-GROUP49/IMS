import { ClipLoader } from 'react-spinners';
import DepartmentCard from 'components/DepartmentCard';

export const DepartmentList = ({ departments }: any) => {
	return (
		<div className="flex flex-col gap-6 user-list">
			<div>
				<p className="text-body font-semi-bold users-list">List of departments</p>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<tbody>
						{departments ? (
							(departments as []).map((department) => (
								<DepartmentCard key={department['department_id']} department={department} />
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
