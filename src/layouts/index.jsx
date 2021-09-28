import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import AppLayout from '@alicloud/console-components-app-layout';
import Login from '@/pages/Login/index';
import Navbar from './Navbar/Navbar';
import Menu from './Menu/Menu';
import MidTerminal from '@/components/MidTerminal';
import Routes from './routes';
import Storage from '@/utils/storage';
import styles from './layout.module.scss';

export default function Layout() {
	const redirectToLogin = () => (
		<Router>
			<Route path={['/', '/login']} component={Login} />
		</Router>
	);

	const redirectToTerminal = () => (
		<Router>
			<Route path="/terminal/:url" component={MidTerminal} exact />
		</Router>
	);
	if (!Storage.getLocal('token')) {
		return redirectToLogin();
	}
	if (window.location.href.includes('terminal')) {
		return redirectToTerminal();
	}

	return (
		<div className={styles['flex-layout']}>
			<Router>
				<Navbar />
				<AppLayout
					nav={<Menu />}
					navCollapsible={true}
					className={styles['middleware-layout']}
				>
					<Routes />
				</AppLayout>
			</Router>
		</div>
	);
}
