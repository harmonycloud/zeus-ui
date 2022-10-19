import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import OperationNavbar from './OperationNavbar';
import { consoleUser, ParamsProps } from './index.d';
import SqlAudit from './SqlAudit';
import OperatorHeader from './OperatorHeader';
import './index.scss';
import AccountMag from './AccountMag';
import SqlConsole from './SqlConsole';
import DatabaseMag from './DatabaseMag';
import LoginConsole from './OperatorHeader/LoginConsole';

export default function OperationPanel(): JSX.Element {
	const params: ParamsProps = useParams();
	// TODO 每个中间件的账户的数据结构确认
	// TODO 进入页面前确认登陆用户
	const [open, setOpen] = useState<boolean>(false);
	const [currentUser, setCurrentUser] = useState<consoleUser>();
	useEffect(() => {
		if (!currentUser) {
			setOpen(true);
		}
	}, []);
	const childrenRender = () => {
		switch (params.currentTab) {
			case 'sqlConsole':
				return (
					<SqlConsole
						currentUser={currentUser}
						setOpen={(value: boolean) => setOpen(value)}
					/>
				);
			case 'accountMag':
				return <AccountMag />;
			case 'sqlAudit':
				return <SqlAudit />;
			case 'databaseMag':
				return <DatabaseMag />;
			default:
				break;
		}
	};
	return (
		<div className="zeus-mid-layout">
			<OperationNavbar />
			<div className="zeus-mid-content">
				{params.currentTab !== 'sqlConsole' && (
					<OperatorHeader
						currentUser={currentUser}
						loginOut={() => {
							if (currentUser) {
								setOpen(false);
							} else {
								window.close();
							}
						}}
					/>
				)}
				{childrenRender()}
			</div>
			{open && (
				<LoginConsole
					open={open}
					onCancel={() => setOpen(false)}
					currentUser={currentUser}
					projectId={params.projectId}
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
					middlewareType={params.type}
				/>
			)}
		</div>
	);
}
