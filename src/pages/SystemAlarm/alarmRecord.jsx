import React, { useEffect, useState } from 'react';
import Table from '@/components/MidTable';
import moment from 'moment';
import {getEvent} from '@/services/platformOverview'
import { Divider } from '@alifd/next';

function AlarmRecord() {
    const [current, setCurrent] = useState(1); // 页码 current
	const [level, setLevel] = useState(''); // level
	const [total, setTotal] = useState(10); // 总数
	const [eventData, setEventData] = useState([]);

    const onRefresh = () => {
        console.log(111);
    }

    const createTimeRender = (value) => {
        if (!value) return '/';
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
    };

    useEffect(() => {
        const sendData = {
            current: current,
            size: 10,
            level: level
        };
        getEvent(sendData).then((res) => {
            console.log(res);
            setEventData(res.data ? res.data.list : []);
            setTotal(res.data ? res.data.total : 0);
        });
    },[])

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
                    '请输入告警ID、告警内容、告警规则/实际监测搜索',
                // onSearch: handleSearch,
                // onChange: handleChange,
                // value: keyword
            }}
            searchStyle={{
                width: '360px'
            }}
        // onSort={onSort}
        >
            <Table.Column title="告警ID" dataIndex="clusterId" />
            <Table.Column title="告警等级" dataIndex="level" />
            <Table.Column title="告警内容" dataIndex="message" />
            <Table.Column title="告警对象" dataIndex="name" />
            <Table.Column title="规则描述" dataIndex="x" />
            <Table.Column title="实际监测" dataIndex="x" />
            <Table.Column
                title="告警时间"
                dataIndex="x"
                cell={createTimeRender}
                sortable />
        </Table>
    )
}

export default AlarmRecord