import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import { Button, Message, Switch, Balloon } from '@alicloud/console-components';
import Confirm from '@alicloud/console-components-confirm';
import { connect } from 'react-redux';
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
import { setRefreshCluster } from '@/redux/globalVar/var';
interface NamespaceProps {
	setRefreshCluster: (flag: boolean) => void;
}
const Tooltip = Balloon.Tooltip;
const Namespace = (props: NamespaceProps) => {
	const { setRefreshCluster } = props;
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
					const newTemp = temp.sort(function (a: any, b: any) {
						const result =
							Number(a.phase === 'Active') -
							Number(b.phase === 'Active');
						return result > 0 ? -1 : 1;
					});
					setDataSource([...newTemp]);
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
				const newTemp = temp.sort(function (a: any, b: any) {
					const result =
						Number(a.phase === 'Active') -
						Number(b.phase === 'Active');
					return result > 0 ? -1 : 1;
				});
				setDataSource([...newTemp]);
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
				const msg = value ? '命名空间注册成功' : '命名空间关闭成功';
				Message.show(messageConfig('success', '成功', msg));
				const list = dataSource.map((item) => {
					if (item.name === record.name) {
						item.registered = value;
					}
					return item;
				});
				setDataSource(list);
				setRefreshCluster(true);
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
		return record.registered && record.middlewareReplicas ? (
			<Tooltip trigger={<Switch checked={value} />} align="l">
				本命名空间已发布中间件服务，使用中，不可关闭
			</Tooltip>
		) : (
			<Switch
				checked={value}
				disabled={record.phase !== 'Active'}
				onChange={(value: boolean) => handleChange(value, record)}
			/>
		);
	};
	const actionRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		if (
			(record.registered && record.middlewareReplicas) ||
			record.phase !== 'Active'
		) {
			return (
				<Tooltip
					trigger={<span className="delete-disabled">删除</span>}
					align="l"
				>
					{record.phase === 'Active'
						? '本命名空间已发布中间件服务，使用中，不可操作'
						: '该分区正在删除中，无法操作'}
				</Tooltip>
			);
		}
		return (
			<Confirm
				type="error"
				title="确认删除"
				content="确认要删除该命名空间？"
				onConfirm={() => {
					deleteNamespace({ clusterId: id, name: record.name }).then(
						(res) => {
							if (res.success) {
								Message.show(
									messageConfig(
										'success',
										'成功',
										'命名空间删除成功'
									)
								);
								getData();
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
	const nameRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		return (
			<span
				className={record.phase !== 'Active' ? 'delete-disabled' : ''}
			>
				{record.aliasName || value}
			</span>
		);
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
					placeholder: '请输入命名空间名称搜索'
				}}
			>
				<Table.Column
					title="命名空间"
					dataIndex="name"
					cell={nameRender}
				/>
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
					onRefresh={getData}
				/>
			)}
		</div>
	);
};
export default connect(() => ({}), {
	setRefreshCluster
})(Namespace);
