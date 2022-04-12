import { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { Button } from 'components/Button';
import { Header } from 'components/Header';
import { Icon } from 'components/Icon';
import IdeaDetail from 'components/IdeaDetail';
import { MetaTags } from 'components/MetaTags';
import { getCategoryById } from 'pages/api/category';
import { getIdeaById } from 'pages/api/idea';
import { getAccountByAccountId } from 'pages/api/user';
import { ICategoryData, IIdeaData, IIdeasProps } from 'lib/interfaces';

interface IParams extends ParsedUrlQuery {
	category_name: string | string[] | undefined;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const { idea_id: slug } = params as IParams;
	const { ideaData } = await getIdeaById(slug as string);
	const { userData } = await getAccountByAccountId(
		(ideaData as unknown as IIdeaData['idea']).account_id as unknown as string
	);
	const { categoryData } = await getCategoryById(
		(ideaData as unknown as IIdeaData['idea']).category_id as unknown as string
	);
	return {
		props: {
			categoryData,
			userData,
			slug,
			ideaData,
		},
	};
};

const IdeaDetailPage: NextPage<IIdeasProps> = (props) => {
	const { asPath } = useRouter();
	const { slug }: any = props;
	const { ideaData }: any = props;
	const idea = ideaData as IIdeaData['idea'];
	const { categoryData }: any = props;
	const category = categoryData as ICategoryData['category'];
	return (
		<>
			<>
				<MetaTags title={``} description={`Ideas in category`} />
				<Header />
				<main className="body-container flex flex-col gap-6 below-navigation-bar">
					<div className="flex flex-col gap-3 lg:justify-between">
						<Link href={asPath.replace((slug as string).toLowerCase(), '')}>
							<a className="back-link">
								<Icon size="24" name="RotateCcw" />
								Back to ideas list
							</a>
						</Link>
						<div className="flex gap-2 items-center">
							<Icon size="16" name="Hash" />
							<p>{category?.category_name}</p>
						</div>
						<div className="flex justify-between items-center">
							<h1>{idea.idea_title}</h1>
							<Button className="more-option" icon>
								<Icon size="24" name="MoreHorizontal" />
							</Button>
						</div>
					</div>
					<IdeaDetail idea={idea} />
				</main>
			</>
		</>
	);
};

export default IdeaDetailPage;
