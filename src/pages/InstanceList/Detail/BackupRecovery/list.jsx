import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Dialog, Message } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
// import { getBackups, addBackup, deleteBackup } from '@/services/middleware';
import Table from '@/components/MidTable';
import messageConfig from '@/components/messageConfig';
import ComponentsLoading from '@/components/componentsLoading';
import { getBackups, backupNow } from '@/services/backup';
import { statusBackupRender } from '@/utils/utils';
import UseBackupForm from './useBackupForm';

export default function List(props) {
	console.log(props);
	const { clusterId, namespace, data: listData, storage } = props;
	// const history = useHistory();
	// const { middlewareName, type, chartName, chartVersion } = useParams();
	const [backups, setBackups] = useState([]);
	const [backupFileName, setBackupFileName] = useState();
	const [useVisible, setUseVisible] = useState(false);
	useEffect(() => {
		if (
			clusterId !== undefined &&
			namespace !== undefined &&
			listData !== undefined &&
			storage.backup
		) {
			getData();
		}
	}, [props]);

	const getData = () => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: listData.name,
			type: listData.type
		};
		getBackups(sendData).then((res) => {
			if (res.success) {
				setBackups(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const backupOnNow = () => {
		Dialog.show({
			title: '操作确认',
			content: '请确认是否立刻备份？',
			onOk: () => {
				const sendData = {
					clusterId,
					namespace,
					middlewareName: listData.name,
					type: listData.type
				};
				backupNow(sendData)
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', '备份成功')
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};

	const toHandle = (backupFileName) => {
		setBackupFileName(backupFileName);
		setUseVisible(true);
	};

	// 克隆服务
	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton
					disabled={record.backupName === ''}
					onClick={() => toHandle(record.backupName)}
				>
					使用备份
				</LinkButton>
				<LinkButton
					onClick={() => {
						console.log('delete');
						// Dialog.show({
						// 	title: '操作确认',
						// 	content: '备份删除后将无法恢复，请确认执行',
						// 	onOk: () => {
						// 		const sendData = {
						// 			clusterId,
						// 			namespace,
						// 			mysqlName: listData.name,
						// 			backupName: record.backupName,
						// 			backupFileName: record.backupFileName
						// 		};
						// 		deleteBackup(sendData)
						// 			.then((res) => {
						// 				if (res.success) {
						// 					Message.show(
						// 						messageConfig(
						// 							'success',
						// 							'成功',
						// 							'备份删除成功'
						// 						)
						// 					);
						// 				} else {
						// 					Message.show(
						// 						messageConfig(
						// 							'error',
						// 							'失败',
						// 							res
						// 						)
						// 					);
						// 				}
						// 			})
						// 			.finally(() => {
						// 				getData(
						// 					clusterId,
						// 					namespace,
						// 					listData.name
						// 				);
						// 			});
						// 	}
						// });
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};

	const Operation = {
		primary: (
			<Button onClick={backupOnNow} type="primary">
				立即备份
			</Button>
		)
	};

	return (
		<div style={{ marginTop: 16 }}>
			{storage.backup ? (
				<Table
					dataSource={backups}
					exact
					fixedBarExpandWidth={[24]}
					showRefresh
					onRefresh={getData}
					affixActionBar
					primaryKey="key"
					operation={Operation}
				>
					<Table.Column
						title="备份时间"
						dataIndex="backupTime"
						// cell={dateRender}
					/>
					{/* <Table.Column
						title="类型"
						dataIndex="type"
						cell={typeRender}
					/> */}
					<Table.Column
						title="状态"
						dataIndex="status"
						cell={statusBackupRender}
					/>
					<Table.Column title="位置" dataIndex="backupAddressList" />
					<Table.Column title="操作" cell={actionRender} />
				</Table>
			) : (
				<ComponentsLoading type="backup" clusterId={clusterId} />
			)}
			{useVisible && backupFileName !== '' && (
				<UseBackupForm
					visible={useVisible}
					onCancel={() => setUseVisible(false)}
					backupFileName={backupFileName}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={listData.name}
					type={listData.type}
				/>
			)}
		</div>
	);
}
