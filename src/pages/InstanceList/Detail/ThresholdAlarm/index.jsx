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

export default function ThresholdAlarm(props) {
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities
	} = props;
	const [dataSource, setDataSource] = useState([]);
	const [visible, setVisible] = useState(false);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		if (!customMid || capabilities.includes('alert')) {
			getData(clusterId, middlewareName, namespace, searchText);
		}
	}, [props]);

	const getData = (clusterId, middlewareName, namespace, keyword) => {
		const sendData = {
			clusterId,
			keyword,
			middlewareName,
			namespace
		};
		getUsedAlarms(sendData).then((res) => {
			console.log(res);
			if (res.success) {
				setDataSource(res.data);
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

	const handleSearch = (value) => {
		setSearchText(value);
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
			},
			onCancel: () => {}
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
					width={100}
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
					width={180}
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
					width={120}
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
