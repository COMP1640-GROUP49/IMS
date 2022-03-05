module.exports = {
	content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			colors: {
				black: '#000000',
				white: '#FFFFFF',
				'sonic-silver': '#717171',
				platinum: '#E3E3E3',
				silver: '#C6C6C6',
				'sliver-chalice': '#AAAAAA',
				'spanish-grey': '#8E8E8E',
				'davys-grey': '#555555',
				jet: '#393939',
				'eerie-black': '#1C1C1C',
				'caribbean-green': '#34D399',
				'caribbean-green-25': '#CCF4E5',
				'orange-yellow': '#FBBF24',
				'orange-yellow-25': '#FEEFC8',
				'ultra-red': '#FB7185',
				'ultra-red-25': '#FEDBE0',
			},
			fontFamily: {
				sans: ['Be Vietnam Pro', 'sans-serif'],
			},
			fontSize: {
				'heading-1': '3.653rem',
				'heading-2': '2.887rem',
				'heading-3': '2.281rem',
				'heading-4': '1.802rem',
				'heading-5': '1.424rem',
				subtitle: '1.125rem',
				body: '1rem',
				footer: '0.889rem',
			},
			fontWeight: {
				thin: 100,
				'extra-light': 200,
				light: 300,
				regular: 400,
				medium: 500,
				'semi-bold': 600,
				bold: 700,
				'extra-bold': 800,
				black: 900,
			},
			screens: {
				sm: { min: '0px', max: '767px' },
				md: { min: '768px', max: '1023px' },
				lg: { min: '1024px' },
			},
			backgroundImage: {
				'avatar-upload-pattern': "url('../assets/img/upload.svg')",
			},
		},
	},
	plugins: [],
};
