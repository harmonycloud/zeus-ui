import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import OperationNavbar from './OperationNavbar';
import { consoleUser, ParamsProps } from './index.d';
import SqlAudit from './SqlAudit';
import OperatorHeader from './OperatorHeader';
import './index.scss';
import AccountMag from './AccountMag';
import SqlConsole from './SqlConsole';
import DatabaseMag from './DatabaseMag';
import LoginConsole from './OperatorHeader/LoginConsole';
import storage from '@/utils/storage';
import RoleDetail from './AccountMag/RoleDetail';

export default function OperationPanel(): JSX.Element {
	const params: ParamsProps = useParams();
	const history = useHistory();
	const [open, setOpen] = useState<boolean>(false);
	const [currentUser, setCurrentUser] = useState<consoleUser>();
	useEffect(() => {
		if (!currentUser) {
			// * 打开强刷后登录
			setOpen(true);
		}
	}, []);
	useEffect(() => {
		document.title = `${params.name}控制台`;
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
				return <AccountMag currentUser={currentUser} />;
			case 'sqlAudit':
				return <SqlAudit currentUser={currentUser} />;
			case 'databaseMag':
				return <DatabaseMag currentUser={currentUser} />;
			case 'roleDetail':
				return <RoleDetail />;
			default:
				break;
		}
	};
	const onCreate = (values: consoleUser) => {
		setCurrentUser(values);
		storage.setSession('mwToken', values.mwToken);
		setOpen(false);
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
					onCancel={() => {
						if (currentUser) {
							setOpen(false);
						} else {
							window.close();
						}
					}}
					onCreate={onCreate}
					currentUser={currentUser}
					projectId={params.projectId}
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
					middlewareType={params.type}
					version={params.version}
				/>
			)}
		</div>
	);
}