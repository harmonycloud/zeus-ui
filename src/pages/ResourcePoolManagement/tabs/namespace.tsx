import React, { useState } from 'react';
import Table from '@/components/MidTable';
import { Button } from '@alicloud/console-components';

const Namespace = () => {
	const [dataSource, setDataSource] = useState([]);
	const [keyword, setKeyword] = useState<string>('');
	const Operation = {
		primary: (
			<Button type="primary" onClick={() => console.log('add')}>
				新增
			</Button>
		)
	};
	const onSort = (dataIndex: string, order: string) => {
		const temp = dataSource.sort(function (a, b) {
			const result = a[dataIndex] - b[dataIndex];
			return order === 'asc'
				? result > 0
					? 1
					: -1
				: result > 0
				? -1
				: 1;
		});
		setDataSource([...temp]);
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
	};
	const actionRender = (value: any, index: number, record: any) => {
		return <span className="name-link">删除</span>;
	};
	return (
		<div style={{ marginTop: 16 }}>
			<Table
				dataSource={dataSource}
				exact
				primaryKey="key"
				operation={Operation}
				showColumnSetting
				showRefresh
				onRefresh={() => console.log('refresh')}
				onSort={onSort}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入资源分区名称搜索'
				}}
			>
				<Table.Column title="资源分区" dataIndex="namespace" />
				<Table.Column title="CPU配额（核）" dataIndex="cpu" sortable />
				<Table.Column
					title="内存配额（GB）"
					dataIndex="memory"
					sortable
				/>
				<Table.Column
					title="已发布服务"
					dataIndex="services"
					sortable
				/>
				<Table.Column
					title="创建时间"
					dataIndex="createTime"
					sortable
				/>
				<Table.Column title="启用" dataIndex="status" />
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
				/>
			</Table>
		</div>
	);
};
export default Namespace;
