import Link from 'next/link';
import { Icon } from 'components/Icon';
// import { Modal } from 'components/Modal';
// import { useModal } from 'components/UseModal';

export const UserCard = () => {
	// const { isShown, toggle } = useModal();
	return (
		<div className="lg:container mx-auto sm:p-6 md:p-6 lg:p-6">
			<div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center py-7 sm:w-full">
				<h1 className="font-semibold text-black text-heading-4">User</h1>
				{/* <button onClick={toggle} className="btn-create ">
					<Icon name="UserPlus" />
					<span>Create new user account</span>
				</button> */}
				{/* <Modal isShown={isShown} hide={toggle} headerText="Create Uers" modalContent={<h1>dasdadasdas</h1>} /> */}
			</div>
			<div>
				<h1 className="text-body py-3 font-semibold">List Of Users</h1>
			</div>
			<div className="flex flex-col">
				<div className="w-full">
					<div className="border-b border-gray-200 shadow p-0">
						<table className="w-full border-collapse">
							<thead className="w-full hidden lg:table-header-group bg-black h-16 ">
								<tr className="block max-w-full text-left lg:table-row ">
									<th className="thead-th">Avartar</th>
									<th className="thead-th">Username</th>
									<th className="thead-th">Password</th>
									<th className="thead-th">User Role</th>
									<th className="thead-th">Department</th>
									<th className="thead-th">Ctreated</th>
									<th className="thead-th">Action</th>
								</tr>
							</thead>
							<tbody className="bg-white text-left">
								<tr className="tbody-tr">
									<td className="tbody-td items-center">
										<div className="tbody-td-name">Avarta</div>
										<div className="text-body text-black">
											{/* <img src="https://picsum.photos/id/237/200/300" className="w-20 h-20 rounded-[50%]" /> */}
										</div>
									</td>
									<td className="tbody-td">
										<div className="tbody-td-name">Username</div>
										<div className="text-body text-black">QuaiNhan</div>
									</td>
									<td className="tbody-td">
										<div className="tbody-td-name">Password</div>
										<div className="text-body text-black">123456</div>
									</td>
									<td className="tbody-td">
										<div className="tbody-td-name">Roles</div>
										<div className="text-body text-black">QA Manager</div>
									</td>
									<td className="tbody-td">
										<div className="tbody-td-name">Department</div>
										<div className="text-body text-black">IT Department</div>
									</td>
									<td className="tbody-td">
										<div className="tbody-td-name">Created</div>
										<div className="text-body text-black">Jan 1,2022</div>
									</td>

									<td className="flex justify-between px-4 sm:px-3 py-3 lg:table-cell">
										<div className="flex flex-1 justify-between lg:justify-start lg:gap-x-3">
											<Link href="/">
												<a className="btn">
													<Icon name="Edit" size={16} className="hover:text-white" />
													Edit
												</a>
											</Link>
											<Link href="/">
												<a className="btn">
													<Icon name="Trash" size={16} className="hover:text-white" />
													Delete
												</a>
											</Link>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div className="w-full">
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
					</div>
				</div>
			</div>
		</div>
	);
};
