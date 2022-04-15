import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	CoreChartOptions,
	ElementChartOptions,
	PluginChartOptions,
	DatasetChartOptions,
	ScaleChartOptions,
	BarControllerChartOptions,
	ArcElement,
	PointElement,
	LineElement,
	Filler,
} from 'chart.js';
import { _DeepPartialObject } from 'chart.js/types/utils';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import randomColor from 'randomcolor';
import { Bar, Line, Pie } from 'react-chartjs-2';
import 'chartjs-plugin-labels';
import faker from '@faker-js/faker';

interface Options
	extends _DeepPartialObject<
		CoreChartOptions<'bar'> &
			ElementChartOptions<'bar'> &
			PluginChartOptions<'bar'> &
			DatasetChartOptions<'bar'> &
			ScaleChartOptions<'bar'> &
			BarControllerChartOptions
	> {
	datalabels?: {
		color: string;
		anchor: string;
		align: string;
		offset: number;
	};
}
interface PieOptions
	extends _DeepPartialObject<
		CoreChartOptions<'pie'> &
			ElementChartOptions<'pie'> &
			PluginChartOptions<'pie'> &
			DatasetChartOptions<'pie'> &
			ScaleChartOptions<'pie'> &
			BarControllerChartOptions
	> {
	datalabels?: {
		color: string;
		anchor: string;
		align: string;
		offset: number;
	};
}

interface LineOptions
	extends _DeepPartialObject<
		CoreChartOptions<'line'> &
			ElementChartOptions<'line'> &
			PluginChartOptions<'line'> &
			DatasetChartOptions<'line'> &
			ScaleChartOptions<'line'> &
			BarControllerChartOptions
	> {
	datalabels?: {
		color: string;
		anchor: string;
		align: string;
		offset: number;
	};
}

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ChartDataLabels,
	ArcElement,
	PointElement,
	LineElement,
	Filler
);

interface IIdeasInEachDepartment {
	data: [{ department_name: string; ideas_count: number }];
}

interface IContributorsInEachDepartment {
	data: [{ department_name: string; contributors_count: number }];
}

interface IIdeasWithoutCommentsInEachDepartment {
	data: [{ department_name: string; ideas_without_comments_count: number }];
}

interface IAnonymousIdeasInEachDepartment {
	data: [{ department_name: string; anonymous_ideas_count: number }];
}
interface IAnonymousCommentsInEachDepartment {
	data: [{ department_name: string; anonymous_comments_count: number }];
}

type VerticalBarProps = {
	labels: string[];
	data: IIdeasInEachDepartment['data'];
};

export const VerticalBar = ({ labels, data }: VerticalBarProps) => {
	const options: Options = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				color: 'black',
				anchor: 'end',
				align: 'top',
				offset: 1,
				labels: {
					title: {
						font: (context) => {
							const width = context.chart.width;
							const size = Math.round(width / 48);

							return {
								family: 'Be Vietnam Pro',
								size: size,
							};
						},
					},
				},
				formatter: (value) => ((value as number) > 0 ? (value as number) : ''),
			},
		},
		scales: {
			x: {
				grid: {
					color: '#E3E3E3',
				},
				ticks: {
					color: '#717171',
					font: (context) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						} as unknown as undefined;
					},
				},
			},
			y: {
				ticks: {
					color: '#717171',
					font: (context) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						} as unknown as undefined;
					},
				},
				suggestedMax: Math.max(...data.map((department) => department.ideas_count + 1)),
			},
		},
	};

	const dataset = {
		labels,
		datasets: [
			{
				label: 'Ideas',
				data: data.map((department) => department.ideas_count),
				backgroundColor: 'black',
			},
		],
	};

	return <Bar options={options} data={dataset} />;
};

type PieProps = {
	labels: string[];
	data: IIdeasInEachDepartment['data'];
};

export const PieChart = ({ labels, data }: PieProps) => {
	const options: PieOptions = {
		responsive: true,

		plugins: {
			legend: {
				display: true,
				labels: {
					font: {
						family: 'Be Vietnam Pro',
						size:
							typeof window !== 'undefined'
								? window.innerWidth <= 425
									? 10
									: window.innerHeight > 425 && window.innerWidth <= 768
									? 16
									: window.innerWidth > 768 && window.innerWidth <= 1024
									? 18
									: window.innerWidth > 1024 && window.innerWidth <= 1440
									? 14
									: 18
								: 0,
					},
				},
			},
			datalabels: {
				color: 'black',
				anchor: 'center',
				labels: {
					title: {
						textAlign: 'center',
						font: (context) => {
							const width = context.chart.width;
							const size = Math.round(width / 48);

							return {
								family: 'Be Vietnam Pro',
								size: size,
							};
						},
					},
				},
				formatter: (value, context) => {
					if ((value as number) > 0) {
						const sum = eval(context.dataset.data.join('+')) as number;
						const percentage = ((value * 100) / sum).toFixed(2) + '%';
						return `${context.chart.data.labels![context.dataIndex] as string} \n (${percentage})`;
					} else {
						return '';
					}
				},
			},
		},
		scales: {},
	};
	const dataset = {
		labels,
		datasets: [
			{
				label: '% of ideas',
				data: data.map((department) => department.ideas_count),
				backgroundColor: data.map((department) =>
					randomColor({ hue: 'monochrome', luminosity: 'random', count: 1 })
				) as unknown as undefined,
			},
		],
	};

	return <Pie options={options} data={dataset} />;
};

type LineProps = {
	labels: string[];
	data: IContributorsInEachDepartment['data'];
};

export const LineChart = ({ labels, data }: LineProps) => {
	const options: LineOptions = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				color: 'black',
				anchor: 'end',
				align: 'top',
				offset: 1,
				labels: {
					title: {
						font: (context) => {
							const width = context.chart.width;
							const size = Math.round(width / 48);

							return {
								family: 'Be Vietnam Pro',
								size: size,
							};
						},
					},
				},
				formatter: (value) => ((value as number) > 0 ? (value as number) : ''),
			},
		},
		scales: {
			x: {
				grid: {
					color: '#E3E3E3',
				},
				ticks: {
					color: '#717171',
					font: (context) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						} as unknown as undefined;
					},
				},
			},
			y: {
				ticks: {
					color: '#717171',
					font: (context) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						} as unknown as undefined;
					},
				},
				suggestedMax: Math.max(...data.map((department) => department.contributors_count + 1)),
			},
		},
	};
	const dataset = {
		labels,
		datasets: [
			{
				label: 'Contributors',
				data: data.map((department) => department.contributors_count),
				fill: true,
				borderColor: 'black',
			},
		],
	};

	return <Line options={options} data={dataset} />;
};

interface IContributorsInEachDepartment {
	data: [{ department_name: string; contributors_count: number }];
}

type GroupBarProps = {
	labels: string[];
	data1: IAnonymousIdeasInEachDepartment['data'];
	data2: IAnonymousCommentsInEachDepartment['data'];
};

export const GroupBar = ({ labels, data1, data2 }: GroupBarProps) => {
	const options: Options = {
		responsive: true,
		plugins: {
			legend: {
				display: true,
				labels: {
					font: {
						family: 'Be Vietnam Pro',
						size:
							typeof window !== 'undefined'
								? window.innerWidth <= 425
									? 10
									: window.innerHeight > 425 && window.innerWidth <= 768
									? 16
									: window.innerWidth > 768 && window.innerWidth <= 1024
									? 18
									: window.innerWidth > 1024 && window.innerWidth <= 1440
									? 14
									: 18
								: 0,
					},
				},
			},
			datalabels: {
				color: 'black',
				anchor: 'end',
				align: 'top',
				offset: 1,
				labels: {
					title: {
						font: (context) => {
							const width = context.chart.width;
							const size = Math.round(width / 48);

							return {
								family: 'Be Vietnam Pro',
								size: size,
							};
						},
					},
				},
				formatter: (value) => ((value as number) > 0 ? (value as number) : ''),
			},
		},
		scales: {
			x: {
				grid: {
					color: '#E3E3E3',
				},
				ticks: {
					color: '#717171',
					font: (context) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						} as unknown as undefined;
					},
				},
			},
			y: {
				ticks: {
					color: '#717171',
					font: (context) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						} as unknown as undefined;
					},
				},
				suggestedMax:
					Math.max(...data1.map((department) => department.anonymous_ideas_count + 1)) >
					Math.max(...data2.map((department) => department.anonymous_comments_count + 1))
						? Math.max(...data1.map((department) => department.anonymous_ideas_count + 1))
						: Math.max(...data2.map((department) => department.anonymous_comments_count + 1)),
			},
		},
	};

	const dataset = {
		labels,
		datasets: [
			{
				label: 'Anonymous ideas',
				data: data1.map((department) => department.anonymous_ideas_count),
				backgroundColor: randomColor({ hue: 'monochrome', luminosity: 'random', count: 1 }),
			},
			{
				label: 'Anonymous comments',
				data: data2.map((department) => department.anonymous_comments_count),
				backgroundColor: randomColor({ hue: 'monochrome', luminosity: 'random', count: 1 }),
			},
		],
	};

	return <Bar options={options} data={dataset} />;
};

type HorizontalBarProps = {
	labels: string[];
	data: IIdeasWithoutCommentsInEachDepartment['data'];
};

export const HorizontalBar = ({ labels, data }: HorizontalBarProps) => {
	const options: Options = {
		indexAxis: 'y' as const,
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				color: 'black',
				anchor: 'end',
				align: 'right',
				offset: 1,
				labels: {
					title: {
						font: (context) => {
							const width = context.chart.width;
							const size = Math.round(width / 48);

							return {
								family: 'Be Vietnam Pro',
								size: size,
							};
						},
					},
				},
				formatter: (value) => ((value as number) > 0 ? (value as number) : ''),
			},
		},
		scales: {
			x: {
				grid: {
					color: '#E3E3E3',
				},
				ticks: {
					color: '#717171',
					font: (context) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						} as unknown as undefined;
					},
				},
				suggestedMax: Math.max(...data.map((department) => department.ideas_without_comments_count + 1)),
			},
			y: {
				ticks: {
					color: '#717171',
					font: (context) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						} as unknown as undefined;
					},
				},
			},
		},
	};

	const dataset = {
		labels,
		datasets: [
			{
				label: 'Ideas',
				data: data.map((department) => department.ideas_without_comments_count),
				backgroundColor: 'black',
			},
		],
	};

	return <Bar options={options} data={dataset} />;
};
