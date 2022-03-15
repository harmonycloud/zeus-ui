import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import { Button, Message, Dialog, Balloon } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { StoreState, globalVarProps } from '@/types';
import { connect } from 'react-redux';
import { getMirror, deleteMirror } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import { NamespaceResourceProps } from '../resource.pool';
import { paramsProps } from '../detail';
import { nullRender } from '@/utils/utils';
import AddMirrorWarehouse from './addMirrorWarehouse';
import { setRefreshCluster } from '@/redux/globalVar/var';

const MirrorWarehouse = (props: { globalVar: globalVarProps }) => {
	const { namespace } = props.globalVar;
	const [dataSource, setDataSource] = useState<NamespaceResourceProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [visible, setVisible] = useState<boolean>(false);
	const [formData, setFormData] = useState<any>();
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
			<Button type="primary" onClick={() => {
				setIsEdit(false);
				setVisible(true);
			}}>
				新增
			</Button>
		)
	};
	const onSort = (dataIndex: string, order: string) => {
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
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
	};
	const editMirror = (record: any) => {
		setIsEdit(true);
		console.log(record);
		
		setFormData(record);
		setVisible(true);
	}
	const deleteMirrors = (record: any) => {
		Dialog.show({
			title: '操作确认',
			content: '删除将无法找回，是否继续?',
			onOk: () => {
				deleteMirror({
					clusterId: id,
					namespace: namespace.name,
					id: record.id
				}).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '镜像仓库删除成功')
						);
						getData();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};
	const actionRender = (
		value: any,
		index: number,
		record: NamespaceResourceProps
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => editMirror(record)}
				>
					编辑
				</LinkButton>
				<LinkButton onClick={() => deleteMirrors(record)}>
					删除
				</LinkButton>
			</Actions>
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
					data={isEdit ? formData : null}
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
