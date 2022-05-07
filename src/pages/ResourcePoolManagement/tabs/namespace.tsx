import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ProTable from '@/components/ProTable';
import moment from 'moment';
import { Button, notification, Switch, Tooltip, Modal } from 'antd';
import { connect } from 'react-redux';
import {
	getNamespaces,
	deleteNamespace,
	regNamespace
} from '@/services/common';
import { NamespaceResourceProps } from '../resource.pool';
import { paramsProps } from '../detail';
import { nullRender } from '@/utils/utils';
import AddNamespace from './addNamespace';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { ExclamationCircleOutlined } from '@ant-design/icons';
interface NamespaceProps {
	setRefreshCluster: (flag: boolean) => void;
}
const { confirm } = Modal;
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
				notification.success({
					message: '成功',
					description: msg
				});
				const list = dataSource.map((item) => {
					if (item.name === record.name) {
						item.registered = value;
					}
					return item;
				});
				setDataSource(list);
				setRefreshCluster(true);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const registeredRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		return record.registered && record.middlewareReplicas ? (
			<Tooltip title="本命名空间已发布中间件服务，使用中，不可关闭">
				<Switch checked={value} />
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
		record: NamespaceResourceProps,
		index: number
	) => {
		if (
			(record.registered && record.middlewareReplicas) ||
			record.phase !== 'Active'
		) {
			return (
				<Tooltip
					title={
						record.phase === 'Active'
							? '本命名空间已发布中间件服务，使用中，不可操作'
							: '该分区正在删除中，无法操作'
					}
				>
					<span className="delete-disabled">删除</span>
				</Tooltip>
			);
		}
		return (
			<span
				className="name-link"
				onClick={() => {
					confirm({
						title: '确认删除',
						content: '确认要删除该命名空间？',
						icon: <ExclamationCircleOutlined />,
						okText: '确定',
						cancelText: '取消',
						onOk() {
							return deleteNamespace({
								clusterId: id,
								name: record.name
							}).then((res) => {
								if (res.success) {
									notification.success({
										message: '成功',
										description: '命名空间删除成功'
									});
									getData();
								} else {
									notification.error({
										message: '失败',
										description: res.errorMsg
									});
								}
							});
						}
					});
				}}
			>
				删除
			</span>
		);
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
	const nameRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
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
		<div>
			<ProTable
				dataSource={dataSource}
				// exact
				rowKey="name"
				operation={Operation}
				showColumnSetting
				showRefresh
				onRefresh={getData}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入命名空间名称搜索'
				}}
			>
				<ProTable.Column
					title="命名空间"
					dataIndex="name"
					render={nameRender}
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
					sorter={(
						a: NamespaceResourceProps,
						b: NamespaceResourceProps
					) =>
						moment(a.createTime).unix() -
						moment(b.createTime).unix()
					}
					// sortable
				/>
				<ProTable.Column
					title="启用"
					dataIndex="registered"
					render={registeredRender}
				/>
				<ProTable.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
				/>
			</ProTable>
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
