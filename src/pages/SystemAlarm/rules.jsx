import React, { useEffect, useState } from 'react';
import Table from '@/components/MidTable';
import moment from 'moment';

function Rules() {

    const onRefresh = () => {
        console.log(111);
    }

    const createTimeRender = (value) => {
        if (!value) return '/';
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
    };

    return (
        <Table
            dataSource={[{ x: '111' }]}
            exact
            fixedBarExpandWidth={[24]}
            affixActionBar
            showRefresh
            showColumnSetting
            onRefresh={onRefresh}
            primaryKey="key"
            search={{
                placeholder:
                    '请输入登录账户、用户名、手机号、角色进行搜索',
                // onSearch: handleSearch,
                // onChange: handleChange,
                // value: keyword
            }}
            searchStyle={{
                width: '360px'
            }}
        // operation={Operation}
        // onSort={onSort}
        >
            <Table.Column title="告警ID" tabIndex="x" />
            <Table.Column title="告警等级" tabIndex="x" />
            <Table.Column title="告警内容" tabIndex="x" />
            <Table.Column title="告警对象" tabIndex="x" />
            <Table.Column title="规则描述" tabIndex="x" />
            <Table.Column title="实际监测" tabIndex="x" />
            <Table.Column
                title="告警时间"
                tabIndex="x"
                cell={createTimeRender}
                sortable />
        </Table>
    )
}

export default Rules