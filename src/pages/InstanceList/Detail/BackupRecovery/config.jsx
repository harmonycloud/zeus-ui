import React, { useState, useEffect } from 'react';
import { Icon, Message } from '@alicloud/console-components';
import BackupSettingForm from './backupSetting';
import messageConfig from '@/components/messageConfig';
import { getBackupConfig, addBackupConfig } from '@/services/middleware';
import moment from 'moment';
import transTime from '@/utils/transTime';

const weekMap = {
	1: '星期一',
	2: '星期二',
	3: '星期三',
	4: '星期四',
	5: '星期五',
	6: '星期六',
	0: '星期日'
};

export default function Config(props) {
	const {
		data: { clusterId, namespace, data: listData }
	} = props;
	const [visible, setVisible] = useState(false);
	const [backupData, setBackupData] = useState({
		keepBackups: 0,
		cycle: '',
		time: '',
		nextBackupDate: ''
	});

	useEffect(() => {
		if (
			clusterId !== undefined &&
			namespace !== undefined &&
			listData !== undefined
		) {
			getData(clusterId, namespace, listData.name);
		}
	}, []);

	const getData = (clusterId, namespace, mysqlName) => {
		const sendData = {
			clusterId,
			namespace,
			mysqlName
		};
		getBackupConfig(sendData).then((res) => {
			if (res.success) {
				if (res.data) {
					const cycleList = res.data.cron.split(' ');
					const weekTemp = cycleList[4].split(',');
					const cycle = weekTemp.map((item) => {
						return weekMap[item];
					});
					setBackupData({
						keepBackups: res.data.keepBackups,
						cycle: cycle.join(','),
						time: `${cycleList[1]}:${
							cycleList[0] === '0' ? '00' : cycleList[0]
						}`,
						nextBackupDate: res.data.nextBackupDate
					});
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const onCreate = (values) => {
		const minute = moment(values.time).get('minute');
		const hour = moment(values.time).get('hour');
		const week = values.cycle.join(',');
		const cron = `${minute} ${hour} ? ? ${week}`;

		const sendData = {
			clusterId,
			namespace,
			mysqlName: listData.name,
			keepBackups: values.count,
			cron
		};
		addBackupConfig(sendData)
			.then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '备份设置成功')
					);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			})
			.finally(() => {
				getData(clusterId, namespace, listData.name);
			});
		setVisible(false);
	};

	return (
		<div style={{ marginTop: 24 }}>
			<div className="backup-setting" style={{ marginBottom: 24 }}>
				<div className="backup-title">备份设置</div>
				<div className="backup-action" onClick={() => setVisible(true)}>
					<Icon type="edit" /> 编辑
				</div>
			</div>
			<div className="backup-setting">
				<div className="backup-label">备份保留个数</div>
				<div className="backup-value">{backupData.keepBackups}</div>
			</div>
			<div className="backup-setting">
				<div className="backup-label">备份周期</div>
				<div className="backup-value">{backupData.cycle}</div>
			</div>
			<div className="backup-setting">
				<div className="backup-label">备份时间</div>
				<div className="backup-value">{backupData.time}</div>
			</div>
			<div className="backup-setting">
				<div className="backup-label">预计下次备份时间</div>
				<div className="backup-value">
					{transTime.gmt2local(backupData.nextBackupDate)}
				</div>
			</div>
			{visible && (
				<BackupSettingForm
					visible={visible}
					onCreate={onCreate}
					onCancel={() => setVisible(false)}
				/>
			)}
		</div>
	);
}
