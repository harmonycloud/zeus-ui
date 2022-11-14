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
	const [current, setCurrent] = useState<number>(1); // * 页码
	const [total, setTotal] = useState<number | undefined>(10); // * 总数
	const [pageSize, setPageSize] = useState<number>(); // * 每页条数
	const [eventData, setEventData] = useState<evevtDataProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [filters, setFilters] = useState<any[] | undefined>();
	const systemTab = storage.getLocal('systemTab');
	const onRefresh = () => {
		getData(1);
	};

	const createTimeRender = (value: string) => {
		if (!value) return '--';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	useEffect(() => {
		getData(1);
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
		getData(1);
	}, [systemTab, keyword]);

	const getData = (current: number, size?: number) => {
		if (alarmType === 'system') {
			const sendData = {
				lay: 'system',
				keyword,
				current,
				size: size || 10
			};
			getEvents(sendData).then((res) => {
				setEventData(res.data ? res.data.list : []);
			});
		} else {
			const sendData = {
				level: '',
				middlewareName,
				clusterId,
				namespace,
				lay: 'service',
				keyword,
				current,
				size: size || 10
			};
			getEvents(sendData).then((res) => {
				setEventData(res.data ? res.data.list : []);
				setCurrent(res.data.pageNum || 1);
				setTotal(res.data.total);
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

	const nameRender = (value: string) => {
		return alarmType === 'system'
			? value
			: clusterId + '/' + namespace + '/' + type + '/' + middlewareName;
	};

	const handleTableChange = (pagination: any) => {
		getData(pagination.current || 1, pagination.size || 10);
		setCurrent(pagination.current || 1);
		setPageSize(pagination.pageSize);
	};

	if (alarmType !== 'system' && (!monitor || !monitor.alertManager)) {
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
			showRefresh
			showColumnSetting
			onRefresh={onRefresh}
			pagination={{
				total: total,
				current: current,
				pageSize: pageSize
			}}
			rowKey="alertId"
			search={{
				placeholder: '请输入告警内容、规则描述、实际监测搜索',
				onSearch: (value: string) => setKeyword(value),
				style: {
					width: '360px'
				}
			}}
			onChange={handleTableChange}
		>
			<ProTable.Column
				title="告警等级"
				dataIndex="level"
				width={110}
				filters={alarmWarn}
				filterMultiple={false}
				onFilter={(value, record: ServiceRuleItem) =>
					value === record.level
				}
				render={levelRender}
			/>
			{/* <ProTable.Column
				title="告警内容"
				dataIndex="content"
				width={180}
				render={nullRender}
			/> */}
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
