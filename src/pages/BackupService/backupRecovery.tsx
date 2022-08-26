import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { getBackups } from '@/services/backup';
import TableRadio from '@/components/TableRadio';
import { Radio, notification, Button, Divider } from 'antd';

const columns = [
	{ title: '备份记录', dataIndex: 'name' },
	{ title: '备份时间', dataIndex: 'type' }
];

function ProBackupBask(): JSX.Element {
	const params: any = useParams();
	const history = useHistory();
	const { backupName, clusterId, namespace, type } = params;
	const [recoveryType, setRecoveryType] = useState<string>('time');
	const [list, setList] = useState();

	useEffect(() => {
		getBackups({
			backupName: backupName,
			clusterId,
			namespace,
			type
		}).then((res) => {
			if (res.success) {
				setList(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);

	return (
		<ProPage>
			<ProHeader
				title="备份恢复"
				subTitle="发布中间件需要使用的备份任务"
				onBack={() => history.goBack()}
			/>
			<ProContent>
				<h2>恢复方式</h2>
				<Radio.Group
					onChange={(e) => setRecoveryType(e.target.value)}
					value={recoveryType}
				>
					<Radio value="time">选择时间点恢复</Radio>
					<Radio value="record">选择备份记录恢复</Radio>
				</Radio.Group>
				{recoveryType === 'record' ? (
					<TableRadio
						dataSource={list}
						columns={columns}
						style={{ marginTop: 16 }}
					/>
				) : null}
				<Divider />
				<div>
					<Button
						type="primary"
						style={{ marginRight: 16 }}
						// onClick={() => handleSubmit()}
					>
						确认
					</Button>
					<Button onClick={() => history.goBack()}>取消</Button>
				</div>
			</ProContent>
		</ProPage>
	);
}

export default ProBackupBask;
