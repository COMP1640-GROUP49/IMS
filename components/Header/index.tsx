/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useContext, useEffect, useState } from 'react';
import { Avatar } from 'components/Avatar';
import { Button } from 'components/Button';
import { Icon } from 'components/Icon';
import { LinkComponent } from 'components/Link';
import { Logo } from 'components/Logo';
import { UserContext } from 'components/PrivateRoute';
import { IUserData, logOut } from 'pages/api/auth';

export const Header = () => {
	const [openHamburgerMenu, setOpenHamburgerMenu] = useState(false);
	const [openProfileMenu, setOpenProfileMenu] = useState(false);
	const [userData, setUserData] = useState<IUserData>();

	const user = useContext(UserContext);

	useEffect(() => {
		user && setUserData(user);
		// Close hamburger menu in large screen (for displaying navigation bar items in row)
		const screenWidth = window.innerWidth;
		function handleResize() {
			if (screenWidth >= 1024) {
				setOpenHamburgerMenu(false);
			}
		}

		window.addEventListener('resize', handleResize);
	}, [openHamburgerMenu]);

	return (
		<nav className="navigation-bar">
			<div className="hamburger-menu">
				{openHamburgerMenu ? (
					<Button className="btn-icon lg:hidden" onClick={() => setOpenHamburgerMenu(false)}>
						<Icon name="X" size="32" color="black" />
					</Button>
				) : (
					<Button className="btn-icon lg:hidden" onClick={() => setOpenHamburgerMenu(true)}>
						<Icon hasPadding name="Menu" size="32" color="black" />
					</Button>
				)}
			</div>
			<div className={`hamburger-menu__open ${openHamburgerMenu ? '' : 'hidden lg:hamburger-menu__lg'}`}>
				<ul className="menu-list">
					<li className="flex self-start lg:self-center mb-4">
						<Logo width="96" height="96" />
					</li>

					<li>
						<LinkComponent link={`/admin`} title="Dashboard">
							<Icon name="Monitor" size="32" color="black" />
						</LinkComponent>
						<hr />
					</li>
					<ul className="menu-item">
						<li>
							<LinkComponent link={`/admin/users`} title="Users">
								<Icon name="Users" size="32" color="black" />
							</LinkComponent>
						</li>
						<li>
							<LinkComponent link={`/admin/departments`} title="Departments">
								<Icon name="Grid" size="32" color="black" />
							</LinkComponent>
							<hr />
						</li>
					</ul>

					<li>
						<LinkComponent link="/about" title="About">
							<Icon name="Info" size="32" color="black" />
						</LinkComponent>
					</li>
				</ul>
			</div>

			<div className="profile-menu">
				<Button className="flex flex-row items-center gap-4" onClick={() => setOpenProfileMenu(!openProfileMenu)}>
					<div className="btn-avatar">
						{userData?.user_metadata['avatar'] ? (
							<Avatar src={`${userData?.user_metadata['avatar'] as string}`} size="56" className="rounded-full" />
						) : (
							<Avatar src={'/default-avatar.png'} size="56" className="rounded-full" />
						)}
					</div>
					<div className="avatar-label sm:hidden">
						{userData?.user_metadata['username'] && `@${userData?.user_metadata['username'] as string}`}
					</div>
				</Button>
			</div>
			<div className={`profile-menu__open ${openProfileMenu ? '' : 'hidden'}`}>
				<ul className="menu-list">
					<li>
						<LinkComponent link="/profile" title="My Profile">
							<Icon name="User" size="32" color="black" />
						</LinkComponent>
					</li>
					<li>
						<Button onClick={logOut}>
							<LinkComponent link="/login" title="Log Out">
								<Icon name="LogOut" size="32" color="black" />
							</LinkComponent>
						</Button>
					</li>
				</ul>
			</div>
		</nav>
	);
};
