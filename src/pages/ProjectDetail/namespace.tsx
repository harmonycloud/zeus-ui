import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router';
import { Button, notification, Modal } from 'antd';
import Table from '@/components/ProTable';
import Actions from '@/components/Actions';
import { getProjectNamespace, unBindNamespace } from '@/services/project';
import { DetailParams, NamespaceItem, NamespaceProps } from './projectDetail';
import AddNamespace from './addNamespace';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { deleteNamespace } from '@/services/common';
import { clusterType, StoreState } from '@/types';
import {
	ColumnFilterItem,
	TablePaginationConfig
} from 'antd/lib/table/interface';
import { getIsAccessGYT } from '@/services/common';

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;
function Namespace(props: NamespaceProps): JSX.Element {
	const { clusterList, setRefreshCluster } = props;
	const params: DetailParams = useParams();
	const { id, name } = params;
	const [dataSource, setDataSource] = useState<NamespaceItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<NamespaceItem[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [filters, setFilters] = useState<ColumnFilterItem[]>([]);
	const [isAccess, setIsAccess] = useState<boolean>(false);
	useEffect(() => {
		getIsAccessGYT().then((res) => {
			if (res.success) {
				setIsAccess(res.data);
			}
		});
	}, []);
	useEffect(() => {
		let mounted = true;
		getProjectNamespace({ projectId: id }).then((res) => {
			if (mounted) {
				if (res.success) {
					setDataSource(res.data);
					setShowDataSource(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
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
				text: item.nickname,
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
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const actionRender = (
		value: string,
		record: NamespaceItem,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton
					disabled={isAccess}
					title={
						isAccess ? '平台已接入观云台，请联系观云台管理员' : ''
					}
					onClick={() =>
						confirm({
							title: '确认取消接入',
							content: '确认要取消接入该命名空间？',
							okText: '确定',
							cancelText: '取消',
							onOk() {
								return unBindNamespace({
									clusterId: record.clusterId,
									projectId: id,
									namespace: record.name
								}).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '命名空间取消接入成功'
										});
										setRefreshCluster(true);
										getData();
									} else {
										notification.error({
											message: '失败',
											description: res.errorMsg
										});
									}
								});
							}
						})
					}
				>
					取消接入
				</LinkButton>
				<LinkButton
					disabled={isAccess}
					title={
						isAccess ? '平台已接入观云台，请联系观云台管理员' : ''
					}
					onClick={() =>
						confirm({
							title: '确认删除',
							content: '确认要删除该命名空间？',
							okText: '确定',
							cancelText: '取消',
							onOk() {
								return deleteNamespace({
									clusterId: record.clusterId,
									name: record.name
								}).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '命名空间删除成功'
										});
										setRefreshCluster(true);
										getData();
									} else {
										notification.error({
											message: '失败',
											description: res.errorMsg
										});
									}
								});
							}
						})
					}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	const Operation = {
		primary: (
			<Button
				disabled={isAccess}
				title={isAccess ? '平台已接入观云台，请联系观云台管理员' : ''}
				type="primary"
				onClick={() => setVisible(true)}
			>
				新建/接入
			</Button>
		)
	};
	const aliasNameRender = (
		value: string,
		record: NamespaceItem,
		index: number
	) => {
		return (
			<span className="text-overflow" title={value}>
				{value || record.name}
			</span>
		);
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
	const onChange = (
		pagination: TablePaginationConfig,
		filters: any,
		sorter: any,
		extra: any
	) => {
		console.log('params', pagination, filters, sorter, extra);
	};
	return (
		<div className="mt-8">
			<Table
				dataSource={showDataSource}
				rowKey="name"
				operation={Operation}
				showRefresh
				onRefresh={getData}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入关键字搜索'
				}}
				onChange={onChange}
			>
				<Table.Column
					title="命名空间名称"
					dataIndex="aliasName"
					render={aliasNameRender}
				/>
				<Table.Column
					title="所属集群"
					dataIndex="clusterAliasName"
					filterMultiple={false}
					filters={filters}
					onFilter={(value, record: any) =>
						record.clusterId === value
					}
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
				/>
			</Table>
			{visible && (
				<AddNamespace
					projectId={id}
					projectAliasName={name}
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
