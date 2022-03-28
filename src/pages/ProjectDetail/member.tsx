import React, { useState } from 'react';
import Table from '@/components/MidTable';
import { Button } from '@alicloud/console-components';

export default function Member(): JSX.Element {
	const [dataSource, setDataSource] = useState([]);
	const Operation = {
		primary: <Button type="primary">新建</Button>
	};
	const handleSearch = (value: string) => {
		console.log(value);
	};
	return (
		<div className="mt-8">
			<Table
				dataSource={dataSource}
				exact
				primaryKey="key"
				operation={Operation}
				fixedHeader={true}
				showRefresh
				onRefresh={() => console.log('click refresh')}
				// maxBodyHeight="280px"
				search={{
					onSearch: handleSearch,
					placeholder: '请输入服务名称搜索'
				}}
			>
				<Table.Column title="命名空间名称" dataIndex="name" />
				<Table.Column title="所属集群" dataIndex="cluster" />
				<Table.Column title="操作" dataIndex="action" />
			</Table>
		</div>
	);
}
