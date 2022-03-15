/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ['ukrqpqyqympltvzphuzr.supabase.co'],
	},
	// webpack: (config) => {
	// 	config.experiments = { topLevelAwait: true };
	// 	return config;
	// },
};

module.exports = nextConfig;
