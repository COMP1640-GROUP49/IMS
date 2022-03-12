// import { Modal } from 'components/Modal';
// import { useModal } from 'components/UseModal';
// import { UserCard } from 'components/UserCard';
import { UserCard } from 'components/UserCard';
import { IAccountData } from 'lib/interfaces';

export const UserList = ({ accounts }: any) => {
	// const { isShown, toggle } = useModal();
	return (
		<div className="flex flex-col gap-6">
			<div>
				<p className="text-body font-semi-bold">List Of Users</p>
			</div>
			<div className="lg:p-6 lg:shadow-0">
				<table>
					<thead>
						<tr>
							{['Avatar', 'Username', 'Password', 'User Role', 'Department', 'Created', 'Action'].map((field) => (
								<th key={field}>{field}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{accounts ? (
							(accounts as []).map((account) => <UserCard key={account['account_id']} account={account} />)
						) : (
							<tr>
								<td rowSpan={7}>Loading...</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* <div className="w-full">
				<div className="flex lg:gap-x-4 items-center justify-start w-[30%] mr-0 mt-3">
					<button className="py-2 px-2 bg-white hover:bg-black hover:text-white rounded-lg">
						<Icon name="ChevronsLeft" size={16} className="hover:text-white" />
					</button>
					<button className="py-2 px-2 bg-white hover:bg-black hover:text-white rounded-lg">
						<Icon name="ChevronLeft" size={16} className="hover:text-white" />
					</button>
					<ul className="flex lg:gap-x-4 text-body">
						<li className="px-2 py-2 sm:px-3 lg:px-4 bg-white hover:bg-black hover:text-white rounded-lg">1</li>
						<li className="px-2 py-2 sm:px-3 lg:px-4 bg-white hover:bg-black hover:text-white rounded-lg">2</li>
						<li className="px-2 py-2 sm:px-3 lg:px-4 bg-white hover:bg-black hover:text-white rounded-lg">3</li>
						<li className="px-2 py-2 sm:px-3 lg:px-4 bg-white hover:bg-black hover:text-white rounded-lg">4</li>
						<li className="px-2 py-2 sm:px-3 lg:px-4 bg-white hover:bg-black hover:text-white rounded-lg">5</li>
						<li className="px-2 py-2 sm:px-3 lg:px-4 bg-white hover:bg-black hover:text-white rounded-lg">6</li>
					</ul>
					<button className="py-2 px-2 bg-white hover:bg-black hover:text-white rounded-lg">
						<Icon name="ChevronRight" size={16} className="hover:text-white" />
					</button>
					<button className="py-2 px-2 bg-white hover:bg-black hover:text-white rounded-lg">
						<Icon name="ChevronsRight" size={16} className="hover:text-white" />
					</button>
				</div>
			</div> */}
		</div>
	);
};
