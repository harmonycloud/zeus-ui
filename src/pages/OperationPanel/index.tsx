import React, { useState } from 'react';
import { useParams } from 'react-router';
import OperationNavbar from './OperationNavbar';
import { ParamsProps } from './index.d';
import SqlAudit from './SqlAudit';
import OperatorHeader from './OperatorHeader';
import './index.scss';
import AccountMag from './AccountMag';
import SqlConsole from './SqlConsole';

export default function OperationPanel(): JSX.Element {
	const params: ParamsProps = useParams();
	// TODO 每个中间件的账户的数据结构确认
	// TODO 进入页面前确认登陆用户
	const [currentUser, setCurrentUser] = useState();
	const childrenRender = () => {
		switch (params.currentTab) {
			case 'sqlConsole':
				return <SqlConsole />;
			case 'accountMag':
				return <AccountMag />;
			case 'sqlAudit':
				return <SqlAudit />;
			default:
				break;
		}
	};
	return (
		<div className="zeus-mid-layout">
			<OperationNavbar />
			<div className="zeus-mid-content">
				{(params.currentTab === 'accountMag' ||
					params.currentTab === 'sqlAudit') && <OperatorHeader />}
				{childrenRender()}
			</div>
		</div>
	);
}
