import React, { useEffect, useState } from 'react';
import Table from '@/components/MidTable';
import moment from 'moment';
import { getEvent } from '@/services/platformOverview';
import { Divider } from '@alifd/next';

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
]

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

	const onRefresh = () => {
		getData();
	};

	const createTimeRender = (value) => {
		if (!value) return '/';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

    useEffect(() => {
        getData();
    },[middlewareName])

    const getData = () => {
        if(alarmType === 'system'){
            const sendData = {
                current: current,
                size: 10,
                level: level,
                clusterId,
                lay: 'system'
            };
            getEvent(sendData).then((res) => {
                setEventData(res.data ? res.data.list : []);
                setTotal(res.data ? res.data.total : 0);
            });
        }else{
            const sendData = {
                current: current,
                size: 10,
                level: level,
                middlewareName,
                clusterId,
                namespace,
                lay: 'service'
            };
            getEvent(sendData).then((res) => {
                setEventData(res.data ? res.data.list : []);
                setTotal(res.data ? res.data.total : 0);
            });
        }
    }

    const levelRender = (value, index, record) => {
        return( 
            <span className={value + ' level'}>{value && alarmWarn.find(item => item.value === value) ? alarmWarn.find(item => item.value === value).label : ''}</span>
        )
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
                placeholder:
                    '请输入告警ID搜索',
                // onSearch: handleSearch,
                // onChange: handleChange,
                // value: keyword
            }}
            searchStyle={{
                width: '360px'
            }}
        // onSort={onSort}
        >
            <Table.Column title="告警ID" dataIndex="alertId" width={100}/>
            <Table.Column title="告警等级" dataIndex="level" width={100} cell={levelRender} />
            <Table.Column title="告警内容" dataIndex="content" />
            <Table.Column title="告警对象" dataIndex="clusterId" width={100} />
            <Table.Column title="规则描述" dataIndex="expr" width={160} />
            <Table.Column title="实际监测" dataIndex="summary"/>
            <Table.Column
                title="告警时间"
                dataIndex="x"
                cell={createTimeRender}
                sortable />
        </Table>
    )
}

export default AlarmRecord;
