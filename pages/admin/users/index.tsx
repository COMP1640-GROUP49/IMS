/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Pagination from 'components/Pagination';
import { UserContext } from 'components/PrivateRoute';
import { UserList } from 'components/UserList';
import { getUsersList } from 'pages/api/admin';
import { IAccountData, IAccountsProps } from 'lib/interfaces';
import { scrollToElementByClassName } from 'utils/scrollAnimate';

export const getServerSideProps: GetServerSideProps = async () => {
	const { data, error } = await getUsersList();
	if (error) {
		throw error;
	}
	return {
		props: {
			data,
		},
	};
};

const UsersManagement: NextPage<IAccountsProps> = ({ data: accounts }) => {
	const { asPath } = useRouter();
	const limit = 5;
	const [currentItems, setCurrentItems] = useState<IAccountData[]>();
	const [pageCount, setPageCount] = useState(0);
	const [itemOffset, setItemOffset] = useState(0);

	useEffect(() => {
		const endOffset = itemOffset + limit;
		setCurrentItems(accounts.slice(itemOffset, endOffset));
		setPageCount(Math.ceil(accounts.length / limit));
	}, [itemOffset, accounts, limit]);

	const handlePageClick = (event: any) => {
		const newOffset = (event.selected * limit) % accounts.length;
		setItemOffset(newOffset);
	};

	const handlePaginationClick = () => {
		scrollToElementByClassName('scrollPos');
	};
	const user = useContext(UserContext);
	return (
		<>
			{user ? (
				+user.user_metadata?.role === 0 ? (
					<>
						<MetaTags title="Users Management" description="Manage users of IMS" />
						<Header />
						<main className="body-container flex flex-col gap-6 below-navigation-bar">
							<div className="flex flex-col gap-6 lg:flex-row lg:justify-between items-center">
								<h1 className="scrollPos">Users</h1>
								<Link href={`${asPath}/create`} passHref>
									<a>
										<Button icon className="btn-primary self-start sm:self-stretch">
											<Icon name="UserPlus" size="16" />
											Create new user account
										</Button>
									</a>
								</Link>
							</div>
							<UserList accounts={currentItems} />
							<Pagination
								items={accounts as []}
								currentItems={currentItems as []}
								itemOffset={itemOffset}
								pageCount={pageCount}
								handlePaginationClick={handlePaginationClick}
								handlePageClick={handlePageClick}
							/>
						</main>
					</>
				) : (
					<ClipLoader />
				)
			) : (
				<ClipLoader />
			)}
		</>
	);
};
export default UsersManagement;
