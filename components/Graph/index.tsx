/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
	Scriptable,
	ScriptableScaleContext,
} from 'chart.js';
import { _DeepPartialObject } from 'chart.js/types/utils';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import randomColor from 'randomcolor';
import { Bar, Pie } from 'react-chartjs-2';

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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels, ArcElement);

interface IIdeasInEachDepartment {
	data: [{ department_name: string; ideas_count: number }];
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
					font: (context: any) => {
						const width = context.chart.width;
						const size = Math.round(width / 48);

						return {
							family: 'Be Vietnam Pro',
							size: size,
						};
					},
				},
			},
			datalabels: {
				color: 'black',
				anchor: 'end',
				align: 'start',
				offset: -24,
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
		scales: {},
	};
	const dataset = {
		labels,
		datasets: [
			{
				label: '% of ideas',
				data: data.map((department) => department.ideas_count),
				backgroundColor: data.map((department) => randomColor({ hue: 'monochrome', count: 1 })) as unknown as undefined,
			},
		],
	};

	return <Pie options={options} data={dataset} />;
};
