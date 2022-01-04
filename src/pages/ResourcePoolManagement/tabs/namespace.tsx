import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import { Button, Message, Switch, Balloon } from '@alicloud/console-components';
import Confirm from '@alicloud/console-components-confirm';
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

const Tooltip = Balloon.Tooltip;
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
					const temp = res.data.sort(function (a: any, b: any) {
						const result =
							Number(a.registered) - Number(b.registered);
						return result > 0 ? -1 : 1;
					});
					setDataSource([...temp]);
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
				const temp = res.data.sort(function (a: any, b: any) {
					const result = Number(a.registered) - Number(b.registered);
					return result > 0 ? -1 : 1;
				});
				setDataSource([...temp]);
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
	const handleChange = (value: boolean, record: NamespaceResourceProps) => {
		regNamespace({
			clusterId: id,
			name: record.name,
			registered: value
		}).then((res) => {
			if (res.success) {
				const msg = value ? '资源分区注册成功' : '资源分区关闭成功';
				Message.show(messageConfig('success', '成功', msg));
				const list = dataSource.map((item) => {
					if (item.name === record.name) {
						item.registered = value;
					}
					return item;
				});
				setDataSource(list);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const registeredRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		return record.registered ? (
			<Tooltip trigger={<Switch checked={value} />} align="l">
				本资源分区已发布中间件服务，使用中，不可关闭
			</Tooltip>
		) : (
			<Switch
				checked={value}
				onChange={(value: boolean) => handleChange(value, record)}
			/>
		);
	};
	const actionRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		if (record.middlewareReplicas > 0) {
			return (
				<Tooltip
					trigger={<span className="delete-disabled">删除</span>}
					align="l"
				>
					本资源分区已发布中间件服务，使用中，不可操作
				</Tooltip>
			);
		}
		return (
			<Confirm
				type="error"
				title="确认删除"
				content="确认要删除该资源分区？"
				onConfirm={() => {
					deleteNamespace({ clusterId: id, name: record.name }).then(
						(res) => {
							if (res.success) {
								Message.show(
									messageConfig(
										'success',
										'成功',
										'资源分区删除成功'
									)
								);
							} else {
								Message.show(
									messageConfig('error', '失败', res)
								);
							}
						}
					);
				}}
			>
				<span className="name-link">删除</span>
			</Confirm>
		);
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
