import Image from 'next/image';
import React, { useState } from 'react';
import { Icon } from 'components/Icon';
import { Logo } from 'components/Logo';
import { LinkComponents } from '../Link';

export const Header = () => {
	const [open, setOpen] = useState(false);
	const [user, setUser] = useState(false);
	return (
		<nav className="bg-white w-[100%] h-[105px] fixed top-0 text-black text-xl flex justify-between lg:items-center z-50 ">
			<div className="flex gap-x-4 items-center h-full mx-2">
				{open ? (
					<button className="w-12 hover:cursor-pointer hover:opacity-80  lg:hidden" onClick={() => setOpen(false)}>
						<Icon name="X" size="32" color="black" />
					</button>
				) : (
					<button className="w-12 hover:cursor-pointer hover:opacity-80 lg:hidden" onClick={() => setOpen(true)}>
						<Icon name="AlignJustify" size="32" color="black" />
					</button>
				)}
			</div>

			<div className="flex flex-row mr-auto">
				<ul
					className={`flex lg:flex-row flex-col justify-evenly absolute left-0 lg:static lg:w-auto w-96  h-[50vh] lg:h-auto bg-white top-[105px] space-y-5 lg:space-y-0 lg:items-center  
                    ${
											open ? 'block' : 'hidden lg:inline-flex'
										} transition-all duration-500 ease-in-out pb-8 pt-2 lg:py-0 lg:mr-4 shadow-[5px 10px 20px rgba(0, 0, 0, 0.8)] md:shadow-none`}
				>
					<div>
						<a className="flex items-center m-auto lg:h-auto bg-white space-y-5 lg:space-y-0 transition-all duration-500 ease-in pb-4 lg:py-3 mr-4 lg:w-20 ml-2">
							<Logo width="96" height="96" />
						</a>
					</div>

					<li>
						<LinkComponents link="/" title="Dashboad">
							<Icon name="Monitor" size="32" color="black" />
						</LinkComponents>
					</li>
					<hr />
					<li>
						<LinkComponents link="/" title="User">
							<Icon name="Users" size="32" color="black" />
						</LinkComponents>
					</li>
					<li>
						<LinkComponents link="/" title="Department">
							<Icon name="Grid" size="32" color="black" />
						</LinkComponents>
					</li>
					<hr />
					<li>
						<LinkComponents link="/" title="About">
							<Icon name="Info" size="32" color="black" />
						</LinkComponents>
					</li>
				</ul>
			</div>

			<div>
				<div className="flex gap-x-1 items-center h-full mx-2 mr-5">
					{user ? (
						<button
							className=" hover:cursor-pointer hover:opacity-80 transition-all flex flex-row items-center"
							onClick={() => setUser(false)}
						>
							<span className="mr-3">
								<Icon name="User" size="32" color="black" />
							</span>
							<span>abcxyz</span>
						</button>
					) : (
						<button
							className="hover:cursor-pointer hover:opacity-80  transition-all flex flex-row items-center"
							onClick={() => setUser(true)}
						>
							<span className="mr-3">
								<Icon name="User" size="32" color="black" />
							</span>
							<span>abcxyz</span>
						</button>
					)}
				</div>
				<ul
					className={`flex flex-col gap-y-4 absolute right-0 w-64 h-32 lg:h-auto bg-white top-[105px] space-y-5 lg:space-y-0 lg:items-center ${
						user ? 'block' : 'hidden'
					} transition-all duration-500 ease-in-out py-4 shadow-5xl`}
				>
					<li className="hover:cursor-pointer hover:bg-white lg:hover:bg-transparent lg:text-black hover:text-slate-900 w-[90%] ml-auto rounded-l-[30px] transition-all pl-1 lg:pl-5 ease-in-out flex justify-between items-center">
						<span className="flex justify-start items-center">
							<Icon name="User" size="32" />
							<h1 className="ml-3">My Profile</h1>
						</span>
						<span>
							<Icon name="ChevronRight" size="32" />
						</span>
					</li>
					<li className="hover:cursor-pointer hover:bg-white lg:hover:bg-transparent lg:text-black hover:text-slate-900 w-[90%] ml-auto rounded-l-[30px] transition-all pl-1 lg:pl-5 ease-in-out flex justify-between items-center">
						<span className="flex justify-start items-center">
							<Icon name="LogOut" size="32" />
							<h1 className="ml-3">Log out</h1>
						</span>
						<span>
							<Icon name="ChevronRight" size="32" />
						</span>
					</li>
				</ul>
			</div>
		</nav>
	);
};
