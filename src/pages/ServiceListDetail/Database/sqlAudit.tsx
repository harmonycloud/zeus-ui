import React, { useState, useEffect } from 'react';
import { Button, Dialog, Message, Radio } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import {
	getUserList,
	deleteUser,
} from '@/services/user';
import messageConfig from '@/components/messageConfig';
import { nullRender } from '@/utils/utils';
import DatabaseForm from './databaseForm';

function UserManage(): JSX.Element {
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');

	useEffect(() => {}, []);
	useEffect(() => {
		let mounted = true;
		getUserList({ keyword: keyword }).then((res) => {
			if (res.success) {
				if (mounted) {
					setDataSource(res.data);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		return () => {
			mounted = false;
		};
	}, []);
	const onRefresh: () => void = () => {
		getUserList({ keyword: keyword }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const handleChange: (value: string) => void = (value: string) => {
		setKeyword(value);
	};
	const handleSearch: (value: string) => void = (value: string) => {
		onRefresh();
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const dsTemp = dataSource.sort((a, b) => {
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
			setDataSource([...dsTemp]);
		}
	};

	const createTimeRender = (value: string) => {
		if (!value) return '--';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};
	return (
		<>
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
					placeholder: '请输入',
					onSearch: handleSearch,
					onChange: handleChange,
					value: keyword
				}}
				searchStyle={{
					width: '360px'
				}}
				onSort={onSort}
			>
				<Table.Column title="操作ip" dataIndex="aliasName" />
				<Table.Column
					title="操作账户"
					dataIndex="email"
					cell={nullRender}
				/>
                <Table.Column
					title="数据库名称"
					dataIndex="roleName"
					cell={nullRender}
				/>
				<Table.Column
					title="执行语句"
					dataIndex="phone"
					cell={nullRender}
				/>
				<Table.Column
					title="执行时间"
					dataIndex="createTime"
					cell={createTimeRender}
					sortable
				/>
			</Table>
		</>
	);
}

export default UserManage;
