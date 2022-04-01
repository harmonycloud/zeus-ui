import React, { useState, useEffect } from 'react';
import { Button, Message } from '@alicloud/console-components';
import Confirm from '@alicloud/console-components-confirm';
import { connect } from 'react-redux';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import { getProjectNamespace, unBindNamespace } from '@/services/project';
import { DetailParams, NamespaceItem, NamespaceProps } from './projectDetail';
import AddNamespace from './addNamespace';
import messageConfig from '@/components/messageConfig';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { Actions, LinkButton } from '@alicloud/console-components-actions';
import { deleteNamespace } from '@/services/common';
import { clusterType, StoreState } from '@/types';
import { filtersProps } from '@/types/comment';

function Namespace(props: NamespaceProps): JSX.Element {
	const { clusterList, setRefreshCluster } = props;
	const [dataSource, setDataSource] = useState<NamespaceItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<NamespaceItem[]>([]);
	const params: DetailParams = useParams();
	const { id } = params;
	const [visible, setVisible] = useState<boolean>(false);
	const [filters, setFilters] = useState<filtersProps[]>([]);
	useEffect(() => {
		let mounted = true;
		getProjectNamespace({ projectId: id }).then((res) => {
			if (mounted) {
				if (res.success) {
					setDataSource(res.data);
					setShowDataSource(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			}
		});
		return () => {
			mounted = false;
		};
	}, [id]);
	useEffect(() => {
		const lt = clusterList.map((item: clusterType) => {
			return {
				label: item.name,
				value: item.id
			};
		});
		setFilters(lt);
	}, [clusterList]);
	const getData = () => {
		getProjectNamespace({ projectId: id }).then((res) => {
			if (res.success) {
				setShowDataSource(res.data);
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const actionRender = (
		value: string,
		index: number,
		record: NamespaceItem
	) => {
		return (
			<Actions>
				<Confirm
					type="error"
					title="确认取消接入"
					content="确认要取消接入该命名空间？"
					onConfirm={() => {
						unBindNamespace({
							clusterId: record.clusterId,
							projectId: id,
							namespace: record.name
						}).then((res) => {
							if (res.success) {
								Message.show(
									messageConfig(
										'success',
										'成功',
										'命名空间取消接入成功'
									)
								);
								setRefreshCluster(true);
								getData();
							} else {
								Message.show(
									messageConfig('error', '失败', res)
								);
							}
						});
					}}
				>
					<LinkButton>取消接入</LinkButton>
				</Confirm>
				<Confirm
					type="error"
					title="确认删除"
					content="确认要删除该命名空间？"
					onConfirm={() => {
						deleteNamespace({
							clusterId: id,
							name: record.name
						}).then((res) => {
							if (res.success) {
								Message.show(
									messageConfig(
										'success',
										'成功',
										'命名空间删除成功'
									)
								);
								setRefreshCluster(true);
								getData();
							} else {
								Message.show(
									messageConfig('error', '失败', res)
								);
							}
						});
					}}
				>
					<LinkButton>删除</LinkButton>
				</Confirm>
			</Actions>
		);
	};
	const Operation = {
		primary: (
			<Button type="primary" onClick={() => setVisible(true)}>
				新建/接入
			</Button>
		)
	};
	const aliasNameRender = (
		value: string,
		index: number,
		record: NamespaceItem
	) => {
		return value || record.name;
	};
	const handleSearch = (value: string) => {
		const list = dataSource
			.map((item: NamespaceItem) => {
				item.aliasName = item.aliasName || item.name;
				return item;
			})
			.filter((item: NamespaceItem) => item.aliasName.includes(value));
		setShowDataSource(list);
	};
	const onFilter = (filterParams: any) => {
		let list: NamespaceItem[] = [];
		Object.keys(filterParams).forEach((key) => {
			const { selectedKeys } = filterParams[key];
			if (selectedKeys.length) {
				list = dataSource.filter((record) => {
					return selectedKeys.some((value: any) => {
						return record.clusterId === value;
					});
				});
			} else {
				list = dataSource;
			}
		});
		setShowDataSource(list);
	};
	return (
		<div className="mt-8">
			<Table
				dataSource={showDataSource}
				exact
				primaryKey="key"
				operation={Operation}
				fixedHeader={true}
				showRefresh
				onRefresh={getData}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入关键字搜索'
				}}
				onFilter={onFilter}
			>
				<Table.Column
					title="命名空间名称"
					dataIndex="aliasName"
					cell={aliasNameRender}
				/>
				<Table.Column
					title="所属集群"
					dataIndex="clusterAliasName"
					filterMode="single"
					filters={filters}
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
					onRefresh={getData}
				/>
			)}
		</div>
	);
}
const mapStateToProps = (state: StoreState) => ({
	clusterList: state.globalVar.clusterList
});
export default connect(mapStateToProps, { setRefreshCluster })(Namespace);
