import React, { useEffect, useState } from 'react';
import Table from '@/components/MidTable';
import moment from 'moment';
import { LinkButton, Actions } from '@alicloud/console-components-actions';
import { Button, Switch } from '@alifd/next';
import { useHistory } from 'react-router';
import { Message } from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import {
	deleteAlarm,
	deleteAlarms,
	getUsedAlarms,
	getUsedAlarm,
	updateAlarms,
	updateAlarm
} from '@/services/middleware';
import storage from '@/utils/storage';

const alarmWarn = [
	{
		value: 'info',
		label: '一般'
	},
	{
		value: 'warning',
		label: '重要'
	},
	{
		value: 'critical',
		label: '严重'
	}
];

function Rules(props) {
	const history = useHistory();
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities,
		monitor,
		alarmType
	} = props;
	const [searchText, setSearchText] = useState('');
	const [dataSource, setDataSource] = useState([]);

	const onRefresh = () => {
		getData(clusterId, middlewareName, namespace, searchText);
	};

	const createTimeRender = (value) => {
		if (!value) return '/';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	useEffect(() => {
		getData(clusterId, middlewareName, namespace, searchText);
	}, []);

	const getData = (clusterId, middlewareName, namespace, keyword) => {
		if (alarmType === 'system') {
			const sendData = {
				clusterId,
				keyword,
				lay: 'system'
			};
			getUsedAlarm(sendData).then((res) => {
				if (res.success) {
					setDataSource(res.data.list);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		} else {
			const sendData = {
				clusterId,
				keyword,
				middlewareName,
				namespace,
				lay: 'service'
			};
			getUsedAlarms(sendData).then((res) => {
				if (res.success) {
					setDataSource(res.data.list);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	};

	const removeAlarm = (alert) => {
		if (alarmType === 'system') {
			const sendData = {
				clusterId,
				alert
			};
			deleteAlarm(sendData).then((res) => {
				if (res.success) {
					getData(clusterId, middlewareName, namespace, '');
					Message.show(messageConfig('success', '成功', '删除成功'));
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		} else {
			const sendData = {
				clusterId,
				middlewareName,
				namespace,
				alert
			};
			deleteAlarms(sendData).then((res) => {
				if (res.success) {
					getData(clusterId, middlewareName, namespace, '');
					Message.show(messageConfig('success', '成功', '删除成功'));
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	};

	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						history.push('/systemManagement/createAlarm');
						storage.setSession('alarm', { ...props, record });
					}}
				>
					编辑
				</LinkButton>
				<LinkButton onClick={() => removeAlarm(record.alert)}>
					删除
				</LinkButton>
			</Actions>
		);
	};

	const Operation = {
		primary: (
			<Button
				type="primary"
				onClick={() => {
					history.push('/systemManagement/createAlarm');
					storage.setSession('alarm', props);
				}}
			>
				新增
			</Button>
		)
	};

	const ruleRender = (value, index, record) => {
		return `CPU使用率${record.symbol}${record.threshold}%且${record.alertTime}分钟内触发${record.alertTimes}次`;
	};

	const levelRender = (value, index, record) => {
		return (
			<span className={value.severity + ' level'}>
				{value &&
				alarmWarn.find((item) => item.value === value.severity)
					? alarmWarn.find((item) => item.value === value.severity)
							.label
					: ''}
			</span>
		);
	};

	const enableRender = (value, index, record) => {
		return (
			<Switch
				defaultChecked={Number(value) === 1}
				onChange={(checked) => {
					if (alarmType === 'system') {
						const sendData = {
							url: {
								clusterId: record.labels.clusterId
							},
							data: [{ ...record, enable: checked ? 1 : 0 }]
						};
						updateAlarm(sendData).then((res) => {
							if (res.success) {
								getData(
									clusterId,
									middlewareName,
									namespace,
									''
								);
								Message.show(
									messageConfig('success', '成功', '修改成功')
								);
							}
						});
					} else {
						const sendData = {
							url: {
								clusterId,
								namespace,
								middlewareName
							},
							data: [{ ...record, enable: checked ? 1 : 0 }]
						};
						updateAlarms(sendData).then((res) => {
							if (res.success) {
								getData(
									clusterId,
									middlewareName,
									namespace,
									''
								);
								Message.show(
									messageConfig('success', '成功', '修改成功')
								);
							}
						});
					}
				}}
			/>
		);
	};

	return (
		<Table
			dataSource={dataSource}
			exact
			fixedBarExpandWidth={[24]}
			affixActionBar
			showRefresh
			showColumnSetting
			onRefresh={onRefresh}
			primaryKey="key"
			search={{
				placeholder: '请输入规则ID、告警规则、告警内容进行搜索',
				onSearch: () => onRefresh(),
				onChange: (value) => setSearchText(value),
				value: searchText
			}}
			searchStyle={{
				width: '360px'
			}}
			operation={Operation}
			// onSort={onSort}
		>
			<Table.Column title="规则ID" dataIndex="alertId" />
			<Table.Column title="告警对象" dataIndex="name" />
			<Table.Column
				title="告警规则"
				dataIndex="threshold"
				cell={ruleRender}
			/>
			<Table.Column
				title="告警等级"
				dataIndex="labels"
				cell={levelRender}
			/>
			<Table.Column title="告警间隔" dataIndex="silence" />
			<Table.Column title="告警内容" dataIndex="content" />
			<Table.Column
				title="创建时间"
				dataIndex="createTime"
				cell={createTimeRender}
				sortable
			/>
			<Table.Column title="启用" dataIndex="enable" cell={enableRender} />
			<Table.Column title="操作" dataIndex="option" cell={actionRender} />
		</Table>
	);
}

export default Rules;
