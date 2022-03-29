import React, { useState, useEffect } from 'react';
import { Button } from '@alicloud/console-components';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import { getProjectNamespace } from '@/services/project';
import { DetailParams } from './projectDetail';
import AddNamespace from './addNamespace';

export default function Namespace(): JSX.Element {
	const [dataSource, setDataSource] = useState([]);
	const params: DetailParams = useParams();
	const { id } = params;
	const [visible, setVisible] = useState<boolean>(false);
	useEffect(() => {
		getProjectNamespace({ projectId: id }).then((res) => {
			console.log(res);
		});
	}, [id]);
	const getData = () => {
		getProjectNamespace({ projectId: id }).then((res) => {
			console.log(res);
		});
	};
	const Operation = {
		primary: (
			<Button type="primary" onClick={() => setVisible(true)}>
				新建/接入
			</Button>
		)
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
				onRefresh={getData}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入服务名称搜索'
				}}
			>
				<Table.Column title="命名空间名称" dataIndex="name" />
				<Table.Column title="所属集群" dataIndex="cluster" />
				<Table.Column title="操作" dataIndex="action" />
			</Table>
			{visible && (
				<AddNamespace
					visible={visible}
					onCancel={() => setVisible(false)}
					onRefresh={getData}
				/>
			)}
		</div>
	);
}
