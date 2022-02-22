import React, { useEffect, useState } from 'react';

import Table from '@/components/MidTable';
import ComponentsNull from '@/components/ComponentsNull';
import DefaultPicture from '@/components/DefaultPicture';

import moment from 'moment';
import { getEvent } from '@/services/platformOverview';
import { nullRender } from '@/utils/utils';
import { getClusters } from '@/services/common';
import { alarmWarn } from '@/utils/const';

import { alarmRecordProps } from './systemAlarm';
import { poolListItem, evevtDataProps } from '@/types/comment';

function AlarmRecord(props: alarmRecordProps) {
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
	const [filterMode, setFilterMode] = useState<
		'single' | 'multiple' | undefined
	>();

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
						return { label: item.id, value: item.id };
					})
				);
				setFilterMode('single');
			}
		});
	}, [middlewareName]);

	const getData = () => {
		if (alarmType === 'system') {
			const sendData = {
				level: '',
				clusterId,
				lay: 'system',
				keyword
			};
			getEvent(sendData).then((res) => {
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
			getEvent(sendData).then((res) => {
				setEventData(res.data ? res.data.list : []);
				setOriginData(res.data ? res.data.list : []);
			});
		}
	};

	const levelRender = (value: string) => {
		return (
			<span className={value + ' level'}>
				{value && alarmWarn.find((item) => item.value === value)
					? alarmWarn.find((item) => item.value === value).label
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
			<ComponentsNull title="该功能所需要监控告警组件工具支持，您可前往“资源池——>平台组件“进行安装" />
		);
	}

	if (customMid && !capabilities.includes('alert')) {
		return <DefaultPicture />;
	}

	return (
		<Table
			dataSource={eventData}
			exact
			fixedBarExpandWidth={[24]}
			affixActionBar
			showRefresh
			showColumnSetting
			onRefresh={onRefresh}
			primaryKey="key"
			search={{
				placeholder: '请输入告警ID、告警内容、规则描述、实际监测搜索',
				onSearch: onRefresh,
				onChange: (value: string) => setKeyword(value),
				value: keyword
			}}
			searchStyle={{
				width: '360px'
			}}
			onSort={onSort}
			onFilter={onFilter}
		>
			<Table.Column
				title="告警ID"
				dataIndex="alertId"
				width={100}
				cell={nullRender}
			/>
			<Table.Column
				title="告警等级"
				dataIndex="level"
				width={150}
				filters={alarmWarn}
				filterMode="single"
				cell={levelRender}
			/>
			<Table.Column
				title="告警内容"
				dataIndex="content"
				width={200}
				cell={nullRender}
			/>
			<Table.Column
				title="告警对象"
				dataIndex="clusterId"
				cell={nameRender}
				filters={filters}
				filterMode={filterMode}
			/>
			<Table.Column
				title="规则描述"
				dataIndex="expr"
				width={160}
				cell={nullRender}
			/>
			<Table.Column title="实际监测" dataIndex="summary" />
			<Table.Column
				title="告警时间"
				dataIndex="time"
				cell={createTimeRender}
				sortable
			/>
		</Table>
	);
}

export default AlarmRecord;
