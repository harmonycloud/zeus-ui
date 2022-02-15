import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import AppLayout from '@alicloud/console-components-app-layout';

import Login from '@/pages/Login/index';
import Navbar from './Navbar/index';
import Menu from './Menu/Menu';
import MidTerminal from '@/components/MidTerminal';

import Routes from './routes';
import Storage from '@/utils/storage';

import styles from './layout.module.scss';

export default function Layout(): JSX.Element {
	const [clusterId, setClusterId] = useState<string>('');
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

	const getClusterId = (value: string) => {
		setClusterId(value);
	};

	return (
		<div className={styles['flex-layout']}>
			<Router>
				<Navbar getClusterId={getClusterId} />
				<AppLayout
					nav={<Menu clusterId={clusterId} />}
					navCollapsible={true}
					className={styles['middleware-layout']}
				>
					<Routes />
				</AppLayout>
			</Router>
		</div>
	);
}
