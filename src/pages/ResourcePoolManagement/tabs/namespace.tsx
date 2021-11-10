import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import { Button, Message, Switch } from '@alicloud/console-components';
import {
	getNamespaces,
	deleteNamespace,
	regNamespace
} from '@/services/common';
import messageConfig from '@/components/messageConfig';
import { NamespaceResourceProps } from '../resource.pool';
import { paramsProps } from '../detail';
import { nullRender } from '@/utils/utils';
import AddNamespace from './addNamespace';

const Namespace = () => {
	const [dataSource, setDataSource] = useState<NamespaceResourceProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const { id }: paramsProps = useParams();
	useEffect(() => {
		let mounted = true;
		getNamespaces({
			clusterId: id,
			all: true,
			withQuota: true,
			withMiddleware: true,
			keyword: keyword
		}).then((res) => {
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
	}, [keyword]);
	const getData = () => {
		getNamespaces({
			clusterId: id,
			all: true,
			withQuota: true,
			withMiddleware: true,
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const Operation = {
		primary: (
			<Button type="primary" onClick={() => setVisible(true)}>
				新增
			</Button>
		)
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'cpu') {
			const temp = dataSource.sort(function (a, b) {
				const result =
					Number(a.quotas?.cpu[1] || null) -
					Number(b.quotas?.cpu[1] || null);
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...temp]);
		} else if (dataIndex === 'memory') {
			const temp = dataSource.sort(function (a, b) {
				const result =
					Number(a.quotas?.memory[1] || null) -
					Number(b.quotas?.memory[1] || null);
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...temp]);
		} else {
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
		}
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
	};
	const handleChange = (value: boolean) => {
		console.log(value);
	};
	const registeredRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		return <Switch defaultChecked={value} onChange={handleChange} />;
	};
	const actionRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		return <span className="name-link">删除</span>;
	};
	const memoryRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		const result = record.quotas?.memory[1] || '-';
		return <span>{result}</span>;
	};
	const cpuRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		const result = record.quotas?.cpu[1] || '-';
		return <span>{result}</span>;
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
				onRefresh={getData}
				onSort={onSort}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入资源分区名称搜索'
				}}
			>
				<Table.Column title="资源分区" dataIndex="name" />
				<Table.Column
					title="CPU配额（核）"
					dataIndex="cpu"
					cell={cpuRender}
					sortable
				/>
				<Table.Column
					title="内存配额（GB）"
					dataIndex="memory"
					cell={memoryRender}
					sortable
				/>
				<Table.Column
					title="已发布服务"
					dataIndex="middlewareReplicas"
					cell={nullRender}
					sortable
				/>
				<Table.Column
					title="创建时间"
					dataIndex="createTime"
					sortable
				/>
				<Table.Column
					title="启用"
					dataIndex="registered"
					cell={registeredRender}
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
				/>
			</Table>
			{visible && (
				<AddNamespace
					visible={visible}
					onCancel={() => setVisible(false)}
					clusterId={id}
				/>
			)}
		</div>
	);
};
export default Namespace;
