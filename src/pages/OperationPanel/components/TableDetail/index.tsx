import React, { useState } from 'react';
import { Table, Tabs } from 'antd';
import Actions from '@/components/Actions';
const LinkButton = Actions.LinkButton;
export default function TableDetail(): JSX.Element {
	const [dataSource, setDataSource] = useState([
		{ id: 1, tableName: 'test', characterSet: 'utf8', rows: 21 }
	]);
	const [data, setData] = useState([
		{
			uid: 1,
			fieldName: 'name',
			type: 'string',
			description: 'dddd',
			isNull: false,
			increment: true,
			default: ''
		}
	]);
	const columns = [
		{
			title: '表名',
			dataIndex: 'tableName',
			key: 'tableName'
		},
		{
			title: '字符集',
			dataIndex: 'characterSet',
			key: 'characterSet'
		},
		{
			title: '行数',
			dataIndex: 'rows',
			key: 'rows'
		},
		{
			title: '操作',
			dataIndex: 'action',
			key: 'action',
			render: () => (
				<Actions>
					<LinkButton>打开</LinkButton>
					<LinkButton>导出建表语句</LinkButton>
					<LinkButton>导出表结构</LinkButton>
				</Actions>
			)
		}
	];
	const colTable = () => {
		const columns = [
			{ title: '#', dataIndex: 'uid', key: 'uid' },
			{ title: '字段名', dataIndex: 'fieldName', key: 'fieldName' },
			{ title: '类型', dataIndex: 'type', key: 'type' },
			{ title: '描述', dataIndex: 'description', key: 'description' },
			{ title: '可空', dataIndex: 'isNull', key: 'isNull' },
			{ title: '自增', dataIndex: 'increment', key: 'increment' },
			{ title: '默认值', dataIndex: 'default', key: 'default' }
		];
		return (
			<Table
				size="small"
				rowKey="uid"
				columns={columns}
				dataSource={data}
				pagination={false}
			/>
		);
	};
	const indexTable = () => {
		const columns = [
			{ title: '#', dataIndex: 'uid', key: 'uid' },
			{ title: '索引名', dataIndex: 'indexName', key: 'indexName' },
			{ title: '索引类型', dataIndex: 'indexType', key: 'indexType' },
			{ title: '包含列', dataIndex: 'includeCol', key: 'includeCol' },
			{ title: '备注', dataIndex: 'remark', key: 'remark' }
		];
		return (
			<Table
				dataSource={[]}
				rowKey="uid"
				columns={columns}
				pagination={false}
			/>
		);
	};
	const expandedRowRender = () => {
		return (
			<Tabs
				style={{ paddingLeft: '45px' }}
				type="card"
				size="small"
				items={[
					{ label: '列', key: 'col', children: colTable() },
					{ label: '索引', key: 'index', children: indexTable() }
				]}
			/>
		);
	};
	return (
		<Table
			rowKey="id"
			expandable={{ expandedRowRender }}
			dataSource={dataSource}
			columns={columns}
		/>
	);
}
