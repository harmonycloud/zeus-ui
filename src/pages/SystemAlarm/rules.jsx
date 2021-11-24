import React, { useEffect, useState } from 'react';
import Table from '@/components/MidTable';
import moment from 'moment';
import { LinkButton, Actions } from '@alicloud/console-components-actions';
import { Button } from '@alifd/next';
import { useHistory } from 'react-router';
import { deleteAlarm, getUsedAlarms } from '@/services/middleware';

function Rules() {
    const history = useHistory();

    const onRefresh = () => {
        console.log(111);
    }

    const createTimeRender = (value) => {
        if (!value) return '/';
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
    };

    const actionRender = (value, index, record) => {
        return (
            <Actions>
                <LinkButton>
                    编辑
                </LinkButton>
                <LinkButton >
                    删除
                </LinkButton>
            </Actions>
        );
    };

    const Operation = {
		primary: (
			<Button
				type="primary"
				onClick={() => history.push('/systemManagement/createAlarm')}
			>
				新增
			</Button>
		)
	};

    return (
        <Table
            dataSource={[]}
            exact
            fixedBarExpandWidth={[24]}
            affixActionBar
            showRefresh
            showColumnSetting
            onRefresh={onRefresh}
            primaryKey="key"
            search={{
                placeholder:
                    '请输入规则ID、告警规则、告警内容进行搜索',
                // onSearch: handleSearch,
                // onChange: handleChange,
                // value: keyword
            }}
            searchStyle={{
                width: '360px'
            }}
        operation={Operation}
        // onSort={onSort}
        >
            <Table.Column title="规则ID" tabIndex="x" />
            <Table.Column title="告警对象" tabIndex="x" />
            <Table.Column title="告警规则" tabIndex="x" />
            <Table.Column title="告警等级" tabIndex="x" />
            <Table.Column title="告警间隔" tabIndex="x" />
            <Table.Column title="告警内容" tabIndex="x" />
            <Table.Column
                title="创建时间"
                tabIndex="x"
                cell={createTimeRender}
                sortable />
            <Table.Column title="启用" tabIndex="x" />
            <Table.Column title="操作" cell={actionRender} />
        </Table>
    )
}

export default Rules