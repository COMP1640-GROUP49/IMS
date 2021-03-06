/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import 'styles/globals.css';
import type { AppProps } from 'next/app';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import 'nprogress/nprogress.css'; //styles of nprogress
import { Toaster } from 'react-hot-toast';
import PrivateRoute from 'components/PrivateRoute';
//Binding events.
NProgress.configure({ showSpinner: false });
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const MyApp = ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<PrivateRoute>
				<Component {...pageProps} />
				<Toaster position="bottom-center" />
			</PrivateRoute>
		</>
	);
};

export default MyApp;
