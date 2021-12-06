import React, { useEffect, useState } from 'react';
import Table from '@/components/MidTable';
import moment from 'moment';
import { getEvent } from '@/services/platformOverview';

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

function AlarmRecord(props) {
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
	const [current, setCurrent] = useState(1); // 页码 current
	const [level, setLevel] = useState(''); // level
	const [total, setTotal] = useState(10); // 总数
	const [eventData, setEventData] = useState([]);
	const [originData, setOriginData] = useState([]);
	const [keyword, setKeyword] = useState('');

	const onRefresh = () => {
		getData();
	};

	const createTimeRender = (value) => {
		if (!value) return '/';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	useEffect(() => {
		getData();
	}, [middlewareName]);

	const getData = () => {
		if (alarmType === 'system') {
			const sendData = {
				// current: current,
				// size: 10,
				level: level,
				clusterId,
				lay: 'system',
				keyword
			};
			getEvent(sendData).then((res) => {
				setEventData(res.data ? res.data.list : []);
				setTotal(res.data ? res.data.total : 0);
			});
		} else {
			const sendData = {
				// current: current,
				// size: 10,
				level: level,
				middlewareName,
				clusterId,
				namespace,
				lay: 'service'
			};
			getEvent(sendData).then((res) => {
				setEventData(res.data ? res.data.list : []);
				setOriginData(res.data ? res.data.list : []);
				setTotal(res.data ? res.data.total : 0);
			});
		}
	}

	const levelRender = (value, index, record) => {
		return (
			<span className={value + ' level'}>
				{value && alarmWarn.find((item) => item.value === value)
					? alarmWarn.find((item) => item.value === value).label
					: ''}
			</span>
		);
	};

	const onSort = (dataIndex, order) => {
		if (dataIndex === 'createTime') {
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

	const onFilter = (filterParams) => {
		let {
			level: { selectedKeys }
		} = filterParams;
		if (selectedKeys.length === 0) {
			setEventData(originData);
		} else {
			let tempData = null;
			tempData = originData.filter((item) => {
				return item.level === selectedKeys[0];
			});
			setEventData(tempData);
		}
	};

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
				placeholder: '请输入告警ID搜索',
				onSearch: onRefresh,
				onChange: (value) => setKeyword(value),
				value: keyword
			}}
			searchStyle={{
				width: '360px'
			}}
			onSort={onSort}
			onFilter={onFilter}
		>
			<Table.Column title="告警ID" dataIndex="alertId" width={100} />
			<Table.Column
				title="告警等级"
				dataIndex="level"
				width={150}
				filters={alarmWarn}
				filterMode="single"
				cell={levelRender}
			/>
			<Table.Column title="告警内容" dataIndex="content" />
			<Table.Column title="告警对象" dataIndex="clusterId" />
			<Table.Column title="规则描述" dataIndex="expr" width={160} />
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
