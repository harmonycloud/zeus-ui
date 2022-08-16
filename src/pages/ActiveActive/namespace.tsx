import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import { updateDomain } from '@/services/activeActive';
import { getNamespaces } from '@/services/common';
import { nullRender } from '@/utils/utils';
import { Button, notification } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { NamespaceResourceProps } from '../ResourcePoolManagement/resource.pool';
import { NamespaceTableProps } from './activeActive';

const LinkButton = Actions.LinkButton;
export default function NamespaceTable(
	props: NamespaceTableProps
): JSX.Element {
	const { clusterId } = props;
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<NamespaceResourceProps[]>([]);
	useEffect(() => {
		let mounted = true;
		getNamespaces({
			clusterId: clusterId,
			all: true,
			withQuota: true,
			withMiddleware: true,
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				if (mounted) {
					setDataSource(
						res.data.filter(
							(item: NamespaceResourceProps) =>
								item.availableDomain === true
						)
					);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		return () => {
			mounted = false;
		};
	}, [keyword]);
	const handleChangeDomain = (
		value: boolean,
		record: NamespaceResourceProps
	) => {
		updateDomain({
			clusterId: clusterId,
			name: record.name,
			availableDomain: value
		}).then((res) => {
			if (res.success) {
				const msg = value ? '可用区开启成功' : '可用区关闭成功';
				notification.success({
					message: '成功',
					description: msg
				});
				getData();
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const Operation = {
		primary: (
			<Button type="primary" onClick={() => setVisible(true)}>
				新增/接入命名空间
			</Button>
		)
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
	};
	const getData = () => {
		getNamespaces({
			clusterId: clusterId,
			all: true,
			withQuota: true,
			withMiddleware: true,
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				setDataSource(
					res.data.filter(
						(item: NamespaceResourceProps) =>
							item.availableDomain === true
					)
				);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const nameRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		return <span>{record.aliasName || record.name}</span>;
	};
	const memoryRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		const result = record.quotas?.memory[1] || '-';
		return <span>{result}</span>;
	};
	const cpuRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		const result = record.quotas?.cpu[1] || '-';
		return <span>{result}</span>;
	};
	const actionRender = (value: string, record: NamespaceResourceProps) => {
		return (
			<Actions>
				<LinkButton onClick={() => handleChangeDomain(false, record)}>
					关闭可用区
				</LinkButton>
			</Actions>
		);
	};
	return (
		<ProTable
			dataSource={dataSource}
			rowKey="name"
			operation={Operation}
			showRefresh
			onRefresh={getData}
			search={{
				onSearch: handleSearch,
				placeholder: '请输入命名空间名称搜索'
			}}
		>
			<ProTable.Column
				title="命名空间"
				dataIndex="aliasName"
				render={nameRender}
			/>
			<ProTable.Column
				title="命名空间英文名"
				dataIndex="name"
				ellipsis={true}
				// render={nameRender}
			/>
			<ProTable.Column
				title="CPU配额（核）"
				dataIndex="cpu"
				render={cpuRender}
				sorter={(a, b) => {
					return (
						Number(a.quotas?.cpu[1] || null) -
						Number(b.quotas?.cpu[1] || null)
					);
				}}
			/>
			<ProTable.Column
				title="内存配额（GB）"
				dataIndex="memory"
				render={memoryRender}
				sorter={(a, b) => {
					return (
						Number(a.quotas?.memory[1] || null) -
						Number(b.quotas?.memory[1] || null)
					);
				}}
			/>
			<ProTable.Column
				title="已发布服务"
				dataIndex="middlewareReplicas"
				render={nullRender}
				sorter={(
					a: NamespaceResourceProps,
					b: NamespaceResourceProps
				) => a.middlewareReplicas || 0 - b.middlewareReplicas || 0}
			/>
			<ProTable.Column
				title="创建时间"
				dataIndex="createTime"
				width={180}
				sorter={(
					a: NamespaceResourceProps,
					b: NamespaceResourceProps
				) => moment(a.createTime).unix() - moment(b.createTime).unix()}
			/>
			<ProTable.Column
				title="操作"
				dataIndex="action"
				render={actionRender}
			/>
		</ProTable>
	);
}
