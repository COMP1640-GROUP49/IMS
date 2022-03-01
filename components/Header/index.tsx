import Link from 'next/link';
import React, { useState } from 'react';
import { Icon } from 'components/Icon';
import { LinkComponents } from 'components/Link';
import { Logo } from 'components/Logo';

export const Header = () => {
	const [openHamBurgerMenu, setOpenHamBurgerMenu] = useState(false);
	const [openProfileMenu, setOpenProfileMenu] = useState(false);
	return (
		<nav className="navbar">
			<div className="flex">
				{openHamBurgerMenu ? (
					<button className="lg:hidden" onClick={() => setOpenHamBurgerMenu(false)}>
						<Icon name="X" size="48" color="black" />
					</button>
				) : (
					<button className="lg:hidden" onClick={() => setOpenHamBurgerMenu(true)}>
						<Icon name="Menu" size="48" color="black" />
					</button>
				)}
			</div>
			<ul
				className={`hamburger-menu flex lg:flex-row flex-col gap-y-6  lg:gap-x-6 ${
					openHamBurgerMenu ? 'block' : 'hidden lg:inline-flex'
				} `}
			>
				<Link href="/">
					<a>
						<Logo width="96" height="96" />
					</a>
				</Link>
				<LinkComponents link="/" title="Dashboad">
					<Icon name="Monitor" size="32" color="black" />
				</LinkComponents>
				<hr className="lg:hidden" />
				<LinkComponents link="/" title="User">
					<Icon name="Users" size="32" color="black" />
				</LinkComponents>
				<LinkComponents link="/" title="Department">
					<Icon name="Grid" size="32" color="black" />
				</LinkComponents>
				<hr className="lg:hidden" />
				<LinkComponents link="/" title="About">
					<Icon name="Info" size="32" color="black" />
				</LinkComponents>
			</ul>

			<div className="flex items-center">
				<div>
					{openProfileMenu ? (
						<button className="button-profile-center" onClick={() => setOpenProfileMenu(false)}>
							<Icon name="User" size="48" color="black" />
							<span className="sm:hidden md:hidden">abcxyz</span>
						</button>
					) : (
						<button className="button-profile-center" onClick={() => setOpenProfileMenu(true)}>
							<Icon name="User" size="48" color="black" />
							<span className="sm:hidden md:hidden">abcxyz</span>
						</button>
					)}
				</div>
				<ul className={` profile-menu flex flex-col gap-y-6 ${openProfileMenu ? 'block' : 'hidden'}`}>
					<li className="flex items-center gap-x-6">
						<Icon name="User" size="32" />
						<h1>My Profile</h1>
						<span>
							<Icon name="ChevronRight" size="32" />
						</span>
					</li>
					<li className=" flex items-center gap-x-6">
						<Icon name="LogOut" size="32" />
						<h1>Log out</h1>
						<span>
							<Icon name="ChevronRight" size="32" />
						</span>
					</li>
				</ul>
			</div>
		</nav>
	);
};
