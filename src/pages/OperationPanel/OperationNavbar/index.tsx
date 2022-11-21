import React, { useEffect, useState } from 'react';
import { Menu, MenuProps } from 'antd';
import { useParams, useHistory } from 'react-router';
import storage from '@/utils/storage';
import { ParamsProps } from '../index.d';
import './index.scss';
let items: MenuProps['items'] = [
	{
		label: 'SQL窗口',
		key: 'sqlConsole'
	},
	{
		label: '数据库管理',
		key: 'databaseMag'
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
	useEffect(() => {
		setCurrent(params.currentTab);
	}, [params.currentTab]);
	useEffect(() => {
		if (params.type === 'redis') {
			items = items?.filter(
				(item) =>
					item?.key !== 'accountMag' &&
					item?.key !== 'sqlAudit' &&
					item?.key !== 'databaseMag'
			);
		}
		if (params.type === 'postgresql') {
			items = items?.filter((item) => item?.key !== 'sqlAudit');
		}
		if (params.version === '8.0') {
			items = items?.filter((item) => item?.key !== 'sqlAudit');
		}
	}, []);
	const onClick: MenuProps['onClick'] = (e) => {
		setCurrent(e.key);
		history.push(
			`/operationalPanel/${e.key}/${params.projectId}/${params.clusterId}/${params.namespace}/${params.type}/${params.name}/${params.version}`
		);
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
