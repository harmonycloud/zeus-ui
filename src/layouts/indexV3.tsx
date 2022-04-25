import React, { useState } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Navbar from './Navbar';
import MyMenu from './Menu/MyMenu';
import Routes from './routes';
import './layout.scss';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
export default function MyLayout() {
	const [clusterId, setClusterId] = useState<string>('');
	const [collapsed, setCollapsed] = useState<boolean>(false);

	const getClusterId = (value?: string) => {
		setClusterId(value || '');
	};

	return (
		<div className="zeus-mid-layout">
			<Router>
				<Navbar getClusterId={getClusterId} />
				<div className="zeus-mid-content">
					<aside style={{ width: collapsed ? '10px' : '200px' }}>
						<div className="zeus-mid-title">中间件平台</div>
						<MyMenu clusterId={clusterId} />
					</aside>
					<div
						className="zeus-mid-left-content"
						style={{ marginLeft: collapsed ? '15px' : '200px' }}
					>
						<Routes />
					</div>
				</div>
				<div
					className="zeus-mid-flod-content"
					style={{ left: collapsed ? '10px' : '200px' }}
					onClick={() => setCollapsed(!collapsed)}
				>
					{collapsed ? <RightOutlined /> : <LeftOutlined />}
				</div>
			</Router>
		</div>
	);
}
