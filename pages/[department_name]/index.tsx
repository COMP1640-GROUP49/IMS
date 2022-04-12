/* eslint-disable @typescript-eslint/no-misused-promises */
import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useCallback, useState } from 'react';
import { Button } from 'components/Button';
import { CreateTopicModal } from 'components/Form/form';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import { MetaTags } from 'components/MetaTags';
import Modal from 'components/Modal';
import { TopicList } from 'components/TopicList';
import { getDepartmentIdByName } from 'pages/api/department';
import { getTopicsListByDepartmentId } from 'pages/api/topic';
import { ITopicsProps } from 'lib/interfaces';

interface IParams extends ParsedUrlQuery {
	department_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { department_name } = params as IParams;
	const { department_id } = await getDepartmentIdByName(department_name as string);
	const { data } = await getTopicsListByDepartmentId(department_id);

	return {
		props: {
			department_id,
			department_name,
			data,
		},
	};
};

interface IDepartmentProps {
	department_id: string;
	department_name: string;
}

const DepartmentPage: NextPage<ITopicsProps, IDepartmentProps> = (props) => {
	const { data: topics } = props;
	let { department_name }: any = props;
	const { department_id }: any = props;

	if ((department_name as string).length === 2) {
		department_name = (department_name as string).toUpperCase();
	} else {
		department_name = (department_name as string).replace(
			(department_name as string)[0],
			`${(department_name as string)[0].toUpperCase()}`
		);
	}

	const { asPath } = useRouter();
	const [showCreateTopicModal, setShowCreateTopicModal] = useState(false);
	const handleCloseCreateTopicModal = useCallback(() => {
		setShowCreateTopicModal(false);
	}, []);

	const handleShowCreateTopicModal = useCallback(() => {
		setShowCreateTopicModal(!showCreateTopicModal);
	}, [showCreateTopicModal]);

	return (
		<>
			<MetaTags title={`${department_name as string} Department`} />
			<Header />
			<main className="body-container flex flex-col gap-6 below-navigation-bar">
				<div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-6">
					<div className="flex flex-col gap-2">
						<Link href={asPath.replace((department_name as string).toLowerCase(), '')}>
							<a className="back-link">
								<Icon size="24" name="RotateCcw" />
								Back to departments list
							</a>
						</Link>
						<h1>{`${department_name as string} Department`}</h1>
					</div>
					<Button
						onClick={handleShowCreateTopicModal}
						icon
						className="btn-primary  sm:self-stretch md:self-start lg:self-end"
					>
						<Icon size="16" name="FolderPlus" />
						Create new topic
					</Button>
					{showCreateTopicModal && (
						<Modal onCancel={handleCloseCreateTopicModal} headerText={`Create New Topic`}>
							<CreateTopicModal department_id={department_id as string} />
						</Modal>
					)}
				</div>
				<TopicList topics={topics} />
			</main>
		</>
	);
};

export default DepartmentPage;
