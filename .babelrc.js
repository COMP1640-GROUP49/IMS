module.exports = {
	presets: ['next/babel'],
	plugins: [
		'@emotion',
		[
			require.resolve('babel-plugin-module-resolver'),
			{
				root: ['.'],
				alias: {
					components: './components',
					assets: '/.assets',
					pages: './pages',
					public: './public',
					styles: './styles',
					util: './util',
				},
			},
		],
	],
};
