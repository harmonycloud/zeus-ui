import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Breadcrumb, Layout as AntdLayout } from 'antd';
import Login from '@/pages/Login/index';
import Navbar from './Navbar/index';
import MyMenu from './Menu/MyMenu';
import MidTerminal from '@/components/MidTerminal';

import Routes from './routes';
import Storage from '@/utils/storage';
import './layout.scss';

const { Header, Content, Sider, Footer } = AntdLayout;
export default function Layout(): JSX.Element {
	const [clusterId, setClusterId] = useState<string>('');
	const [collapsed, setCollapsed] = useState<boolean>(false);
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

	const getClusterId = (value?: string) => {
		setClusterId(value || '');
	};

	return (
		<div className="flex-layout">
			<Router>
				{/* <Navbar getClusterId={getClusterId} /> */}

				{/* <AppLayout
					nav={<Menu clusterId={clusterId} />}
					navCollapsible={true}
					className={styles['middleware-layout']}
				>
					<Routes />
				</AppLayout> */}
				{/* <AntdLayout style={{ minHeight: '100vh' }}>
					<Sider
						theme="light"
						collapsible
						collapsed={collapsed}
						onCollapse={(collapsed) => setCollapsed(collapsed)}
					>
						<MyMenu clusterId={clusterId} /> */}
				{/* <Menu
							defaultSelectedKeys={['1']}
							mode="inline"
							items={items}
						/> */}
				{/* </Sider>
					<AntdLayout className="site-layout"> */}
				{/* <Header
							className="site-layout-background"
							style={{ padding: 0 }}
						/> */}
				{/* <Content style={{ margin: '50px 16px 0px' }}>
							<Routes />
						</Content> */}
				{/* </AntdLayout>
				</AntdLayout> */}
				<AntdLayout style={{ minHeight: '100vh' }}>
					<Sider
						theme="light"
						collapsible
						collapsed={collapsed}
						onCollapse={(collapsed: boolean) =>
							setCollapsed(collapsed)
						}
						style={{
							overflow: 'auto',
							height: '100vh',
							position: 'fixed',
							left: 0,
							top: 0,
							bottom: 0
						}}
					>
						<div className="logo" />
						<MyMenu clusterId={clusterId} />
					</Sider>
					<AntdLayout className="site-layout">
						<Header
							className="site-layout-background"
							style={{ padding: 0 }}
						/>
						<Content style={{ margin: '0 16px' }}>
							<Breadcrumb style={{ margin: '16px 0' }}>
								<Breadcrumb.Item>User</Breadcrumb.Item>
								<Breadcrumb.Item>Bill</Breadcrumb.Item>
							</Breadcrumb>
							<div
								className="site-layout-background"
								style={{ padding: 24, minHeight: 360 }}
							>
								<Routes />
							</div>
						</Content>
						<Footer style={{ textAlign: 'center' }}>
							Ant Design ©2018 Created by Ant UED
						</Footer>
					</AntdLayout>
				</AntdLayout>
			</Router>
		</div>
	);
}
