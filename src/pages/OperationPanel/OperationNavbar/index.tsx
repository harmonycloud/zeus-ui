import React, { useState } from 'react';
import { Menu, MenuProps } from 'antd';
import { useParams, useHistory } from 'react-router';
import storage from '@/utils/storage';
import { ParamsProps } from '../index.d';
import './index.scss';
const items: MenuProps['items'] = [
	{
		label: 'SQL窗口',
		key: 'sqlConsole'
	},
	{
		label: '账号管理',
		key: 'accountMag'
	},
	{
		label: 'SQL审计',
		key: 'sqlAudit'
	}
];
export default function OperationNavbar(): JSX.Element {
	const params: ParamsProps = useParams();
	const history = useHistory();
	const [current, setCurrent] = useState<string>(params.currentTab);
	// 设置logo
	const personalization = storage.getLocal('personalization');
	const onClick: MenuProps['onClick'] = (e) => {
		setCurrent(e.key);
		history.push(`/operationalPanel/${e.key}`);
	};
	return (
		<div className="operation-navbar">
			<div className="operation-nav">
				<div
					className="logo-box"
					style={{
						lineHeight: '48px',
						textAlign: 'center',
						padding: '5px 0px'
					}}
				>
					<img
						className="logo-png"
						src={personalization && personalization.homeLogo}
						alt=""
					/>
				</div>
				<div className="nav-content">
					<Menu
						onClick={onClick}
						selectedKeys={[current]}
						mode="horizontal"
						items={items}
					/>
				</div>
			</div>
		</div>
	);
}