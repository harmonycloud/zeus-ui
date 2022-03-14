import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import { Button, Message, Switch, Balloon } from '@alicloud/console-components';
import Confirm from '@alicloud/console-components-confirm';
import { StoreState, globalVarProps } from '@/types';
import { connect } from 'react-redux';
import { getMirror, deleteMirror } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import { NamespaceResourceProps } from '../resource.pool';
import { paramsProps } from '../detail';
import { nullRender } from '@/utils/utils';
import AddMirrorWarehouse from './addMirrorWarehouse';
import { setRefreshCluster } from '@/redux/globalVar/var';
interface NamespaceProps {
	globalVar: globalVarProps;
}
const Tooltip = Balloon.Tooltip;
const MirrorWarehouse = (props: NamespaceProps) => {
	const { cluster, namespace } = props.globalVar;

	const [dataSource, setDataSource] = useState<NamespaceResourceProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const { id }: paramsProps = useParams();
	useEffect(() => {
		let mounted = true;
		getMirror({
			clusterId: id,
            namespace: namespace.name,
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				if (mounted) {
					setDataSource(res.data.list);
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
		getMirror({
			clusterId: id,
			namespace: namespace.name,
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data.list);
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
						? '本资源分区已发布中间件服务，使用中，不可操作'
						: '该分区正在删除中，无法操作'}
				</Tooltip>
			);
		}
		return (
			<Confirm
				type="error"
				title="确认删除"
				content="确认要删除该资源分区？"
				onConfirm={() => {
					deleteMirror({ clusterId: id, namespace: namespace.name }).then(
						(res) => {
							if (res.success) {
								Message.show(
									messageConfig(
										'success',
										'成功',
										'资源分区删除成功'
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
	return (
		<div style={{ marginTop: 16 }}>
			<Table
				dataSource={dataSource}
				exact
				primaryKey="key"
				operation={Operation}
				showRefresh
				onRefresh={getData}
				onSort={onSort}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入关键字搜索'
				}}
			>
				<Table.Column title="镜像仓库地址" dataIndex="address" />
				<Table.Column title="镜像仓库项目" dataIndex="project" />
				<Table.Column
					title="描述"
					dataIndex="description"
					cell={nullRender}
				/>
				<Table.Column
					title="创建时间"
					dataIndex="createTime"
					sortable
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
				/>
			</Table>
			{visible && (
				<AddMirrorWarehouse
					visible={visible}
					onCancel={() => setVisible(false)}
					clusterId={id}
                    namespace={namespace.name}
					onRefresh={getData}
				/>
			)}
		</div>
	);
};
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {
	setRefreshCluster
})(MirrorWarehouse);
