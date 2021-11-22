import React, { useState, useEffect } from 'react';
import Table from '@/components/MidTable';
import { Page } from '@alicloud/console-components-page';
import { Button, Dialog, Message } from '@alicloud/console-components';
import CreateAlarm from './createAlarm';
import { getUsedAlarms, deleteAlarm } from '@/services/middleware';
import { alarmStatusRender } from '@/utils/utils';
import messageConfig from '@/components/messageConfig';
import DefaultPicture from '@/components/DefaultPicture';
import { createAlarms } from '@/services/middleware';
import transTime from '@/utils/transTime';
import ComponentNull from '@/components/ComponentsNull';

export default function ThresholdAlarm(props) {
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities,
		monitor
	} = props;
	const [dataSource, setDataSource] = useState([]);
	const [visible, setVisible] = useState(false);
	const [searchText, setSearchText] = useState('');
	console.log(monitor);
	useEffect(() => {
		if (customMid) {
			if (capabilities.includes('alert')) {
				getData(clusterId, middlewareName, namespace, searchText);
			}
		} else {
			getData(clusterId, middlewareName, namespace, searchText);
		}
	}, [props.middlewareName, props.customMid]);

	const getData = (clusterId, middlewareName, namespace, keyword) => {
		const sendData = {
			clusterId,
			keyword,
			middlewareName,
			namespace
		};
		getUsedAlarms(sendData).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const Operation = {
		primary: (
			<Button onClick={() => setVisible(true)} type="primary">
				创建报警规则
			</Button>
		)
	};
	const handleChange = (value) => {
		setSearchText(value);
	};
	const handleSearch = (value) => {
		getData(clusterId, middlewareName, namespace, value);
	};

	const deleteAlarmRule = (record) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			alert: record.alert
		};
		Dialog.show({
			title: '删除提示',
			content: '您确认要删除对象吗？',
			onOk: () => {
				deleteAlarm(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								'该报警规则删除成功'
							)
						);
						getData(
							clusterId,
							middlewareName,
							namespace,
							searchText
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};

	const actionRender = (value, index, record) => {
		return (
			<span className="name-link" onClick={() => deleteAlarmRule(record)}>
				删除
			</span>
		);
	};

	const alarmRender = (value, index, record) => {
		if (record.status === 'creating') {
			return null;
		}
		return (
			<div>
				{record.description}
				{record.symbol}
				{record.threshold}
				{record.unit}持续{record.time}
				就报警
			</div>
		);
	};
	const onCreate = (value) => {
		const sendData = {
			url: {
				clusterId: clusterId,
				middlewareName: middlewareName,
				namespace: namespace
			},
			data: value
		};
		createAlarms(sendData).then((res) => {
			if (res.success) {
				Message.show(
					messageConfig('success', '成功', '告警规则设置成功')
				);
				getData(clusterId, middlewareName, namespace, searchText);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		setVisible(false);
	};

	if (!monitor.alertManager || monitor.alertManager === null) {
		return (
			<ComponentNull title="该功能所需要数据监控和监控告警工具支持，您可前往“资源池——>平台组件进行安装" />
		);
	}

	if (customMid && !capabilities.includes('alert')) {
		return <DefaultPicture />;
	}

	return (
		<Page>
			<Table
				dataSource={dataSource}
				exact
				fixedBarExpandWidth={[24]}
				affixActionBar
				primaryKey="key"
				showRefresh
				onRefresh={() => {
					getData(clusterId, middlewareName, namespace, searchText);
				}}
				operation={Operation}
				search={{
					value: searchText,
					onChange: handleChange,
					onSearch: handleSearch,
					placeholder: '请输入搜索内容'
				}}
			>
				<Table.Column
					title="监控项"
					dataIndex="description"
					width={280}
					lock
				/>
				<Table.Column
					title="状态"
					dataIndex="status"
					cell={alarmStatusRender}
					width={80}
				/>
				<Table.Column
					title="报警规则"
					dataIndex="alarmRule"
					cell={alarmRender}
					width={500}
				/>
				<Table.Column
					title="沉默周期"
					dataIndex="silence"
					width={100}
				/>
				<Table.Column
					title="创建时间"
					dataIndex="createTime"
					cell={(value) => transTime.gmt2local(value)}
					width={160}
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
					width={60}
					lock="right"
				/>
			</Table>
			{visible && (
				<CreateAlarm
					visible={visible}
					onCreate={onCreate}
					onCancel={() => setVisible(false)}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={middlewareName}
					type={type}
				/>
			)}
		</Page>
	);
}
