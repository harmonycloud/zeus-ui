import React, { useEffect, useState } from 'react';

import ProTable from '@/components/ProTable';
import ComponentsNull from '@/components/ComponentsNull';
import DefaultPicture from '@/components/DefaultPicture';

import moment from 'moment';
import { getEvents } from '@/services/platformOverview';
import { nullRender } from '@/utils/utils';
import { getClusters } from '@/services/common';
import { alarmWarn } from '@/utils/const';

import { alarmRecordProps } from './systemAlarm';
import { ServiceRuleItem } from '../ServiceListDetail/detail';
import { poolListItem, evevtDataProps } from '@/types/comment';
import storage from '@/utils/storage';

function AlarmRecord(props: alarmRecordProps): JSX.Element {
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
	const [eventData, setEventData] = useState<evevtDataProps[]>([]);
	const [originData, setOriginData] = useState<evevtDataProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [filters, setFilters] = useState<any[] | undefined>();
	const systemTab = storage.getLocal('systemTab');
	const onRefresh = () => {
		getData();
	};

	const createTimeRender = (value: string) => {
		if (!value) return '--';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	useEffect(() => {
		getData();
		getClusters().then((res) => {
			if (!res.data) return;
			if (alarmType === 'system') {
				setFilters(
					res.data.map((item: poolListItem) => {
						return { text: item.nickname, value: item.id };
					})
				);
			}
		});
	}, [middlewareName]);

	useEffect(() => {
		getData();
	}, [systemTab, keyword]);

	const getData = () => {
		if (alarmType === 'system') {
			const sendData = {
				lay: 'system',
				keyword
			};
			getEvents(sendData).then((res) => {
				setEventData(res.data ? res.data.list : []);
				setOriginData(res.data ? res.data.list : []);
			});
		} else {
			const sendData = {
				level: '',
				middlewareName,
				clusterId,
				namespace,
				lay: 'service',
				keyword
			};
			getEvents(sendData).then((res) => {
				setEventData(res.data ? res.data.list : []);
				setOriginData(res.data ? res.data.list : []);
			});
		}
	};

	const levelRender = (value: string) => {
		return (
			<span className={value + ' level'}>
				{value && alarmWarn.find((item) => item.value === value)
					? alarmWarn.find((item) => item.value === value).text
					: ''}
			</span>
		);
	};

	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'time') {
			const dsTemp = eventData.sort((a, b) => {
				const result =
					moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setEventData([...dsTemp]);
		}
	};

	const onFilter = (filterParams: any) => {
		if (filterParams.level) {
			const {
				level: { selectedKeys }
			} = filterParams;
			if (selectedKeys.length === 0) {
				setEventData(originData);
			} else {
				let tempData = null;
				tempData = originData.filter((item: evevtDataProps) => {
					return item.level === selectedKeys[0];
				});
				setEventData(tempData);
			}
		} else if (filterParams.clusterId) {
			const {
				clusterId: { selectedKeys }
			} = filterParams;
			if (selectedKeys.length === 0) {
				setEventData(originData);
			} else {
				let tempData = null;
				tempData = originData.filter((item: evevtDataProps) => {
					return item.clusterId === selectedKeys[0];
				});
				setEventData(tempData);
			}
		}
	};

	const nameRender = (value: string) => {
		return alarmType === 'system'
			? value
			: clusterId + '/' + namespace + '/' + type + '/' + middlewareName;
	};

	if (!monitor || !monitor.alertManager) {
		return (
			<ComponentsNull title="该功能所需要监控告警组件工具支持，您可前往“集群——>平台组件“进行安装" />
		);
	}

	if (customMid && !capabilities.includes('alert')) {
		return <DefaultPicture />;
	}

	return (
		<ProTable
			dataSource={eventData}
			// exact
			// fixedBarExpandWidth={[24]}
			// affixActionBar
			showRefresh
			showColumnSetting
			onRefresh={onRefresh}
			rowKey="alertId"
			search={{
				placeholder: '请输入告警内容、规则描述、实际监测搜索',
				onSearch: (value: string) => setKeyword(value),
				style: {
					width: '360px'
				}
			}}
			// onSort={onSort}
			// onFilter={onFilter}
		>
			{/* <ProTable.Column
				title="告警ID"
				dataIndex="alertId"
				width={100}
				render={nullRender}
			/> */}
			<ProTable.Column
				title="告警等级"
				dataIndex="level"
				width={110}
				filters={alarmWarn}
				// filterMode="single"
				filterMultiple={false}
				onFilter={(value, record: ServiceRuleItem) =>
					value === record.level
				}
				render={levelRender}
			/>
			<ProTable.Column
				title="告警内容"
				dataIndex="content"
				width={180}
				render={nullRender}
			/>
			{alarmType === 'system' ? (
				<ProTable.Column
					title="告警对象"
					dataIndex="nickname"
					render={nameRender}
					filters={filters}
					width={160}
					// filterMode={filterMode}
					filterMultiple={false}
					onFilter={(value, record: ServiceRuleItem) =>
						value === record.clusterId
					}
				/>
			) : null}
			<ProTable.Column
				title="规则描述"
				dataIndex="expr"
				width={160}
				render={nullRender}
			/>
			<ProTable.Column
				title="实际监测"
				dataIndex="summary"
				render={nullRender}
			/>
			<ProTable.Column
				title="告警时间"
				dataIndex="time"
				render={createTimeRender}
				// sortable
				sorter={(a: any, b: any) =>
					new Date(a.time).getTime() - new Date(b.time).getTime()
				}
				width={160}
			/>
		</ProTable>
	);
}

export default AlarmRecord;
