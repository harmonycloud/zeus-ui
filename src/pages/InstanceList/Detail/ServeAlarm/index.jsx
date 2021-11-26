import React, { useEffect, useState } from 'react';
import Table from '@/components/MidTable';
import moment from 'moment';
import { LinkButton, Actions } from '@alicloud/console-components-actions';
import { Button } from '@alifd/next';
import { useHistory } from 'react-router';
import { connect } from 'react-redux'
import { Message } from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import { deleteAlarm, getUsedAlarms } from '@/services/middleware';
import storage from '@/utils/storage';

function Rules(props) {
    const history = useHistory();
    const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities,
		monitor
	} = props;
    const [searchText, setSearchText] = useState('');
	const [dataSource, setDataSource] = useState([]);

    const onRefresh = () => {
        getData(clusterId, middlewareName, namespace, '');
    }

    const createTimeRender = (value) => {
        if (!value) return '/';
        return moment(value).format('YYYY-MM-DD HH:mm:ss');
    };

    useEffect(() => {
        console.log(props);
        getData(clusterId, middlewareName, namespace, searchText);
    }, []);

    const getData = (clusterId, middlewareName, namespace, keyword) => {
        const sendData = {
            clusterId,
			keyword,
			middlewareName,
			namespace,
            lay: 'service'
        };
        getUsedAlarms(sendData).then((res) => {
            if (res.success) {
                setDataSource(res.data);
            } else {
                Message.show(messageConfig('error', '失败', res));
            }
        });
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
                onClick={() => {
                    history.push('/systemManagement/createAlarm');
                    storage.setSession('alarm',props)
                }}
            >
                新增
            </Button>
        )
    };

    const ruleRender = (value,index,record) => {
        return `CPU使用率${record.symbol}${record.threshold}且${record.alertTime}内触发${record.alertTimes}次`
    }

    const levelRender = (value,index,record) => {
        return value.severity
    }

    return (
        <Table
            dataSource={dataSource}
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
            <Table.Column title="规则ID" tabIndex="alertId" />
            <Table.Column title="告警对象" tabIndex="symbol" />
            <Table.Column title="告警规则" tabIndex="threshold" cell={ruleRender} />
            <Table.Column title="告警等级" tabIndex="labels" cell={levelRender} />
            <Table.Column title="告警间隔" tabIndex="silence" />
            <Table.Column title="告警内容" tabIndex="content" />
            <Table.Column
                title="创建时间"
                tabIndex="createTime"
                cell={createTimeRender}
                sortable />
            <Table.Column title="启用" tabIndex="enable" />
            <Table.Column title="操作" cell={actionRender} />
        </Table>
    )
}

export default Rules;