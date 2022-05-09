import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import moment from 'moment';
import ProTable from '@/components/ProTable';
import { Button, notification, Modal } from 'antd';
import Actions from '@/components/Actions';
import { StoreState, globalVarProps } from '@/types';
import { getMirror, deleteMirror } from '@/services/common';
import { NamespaceResourceProps } from '../resource.pool';
import { paramsProps } from '../detail';
import { nullRender } from '@/utils/utils';
import AddMirrorWarehouse from './addMirrorWarehouse';
import { setRefreshCluster } from '@/redux/globalVar/var';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
const MirrorWarehouse = (props: { globalVar: globalVarProps }) => {
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
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				if (mounted) {
					setDataSource(res.data.list);
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
		getMirror({
			clusterId: id,
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data.list);
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
			<Button
				type="primary"
				onClick={() => {
					setIsEdit(false);
					setVisible(true);
				}}
			>
				新增
			</Button>
		)
	};

	const handleSearch = (value: string) => {
		setKeyword(value);
	};
	const editMirror = (record: any) => {
		setIsEdit(true);
		setFormData(record);
		setVisible(true);
	};
	const deleteMirrors = (record: any) => {
		confirm({
			title: '操作确认',
			content: '删除将无法找回，是否继续?',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				return deleteMirror({
					clusterId: id,
					id: record.id
				}).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '镜像仓库删除成功'
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
	};
	const actionRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton onClick={() => editMirror(record)}>编辑</LinkButton>
				<LinkButton onClick={() => deleteMirrors(record)}>
					删除
				</LinkButton>
			</Actions>
		);
	};
	return (
		<div>
			<ProTable
				dataSource={dataSource}
				rowKey="address"
				operation={Operation}
				showRefresh
				onRefresh={getData}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入关键字搜索'
				}}
			>
				<ProTable.Column
					title="镜像仓库地址"
					dataIndex="address"
					width={150}
				/>
				<ProTable.Column
					title="镜像仓库项目"
					dataIndex="project"
					width={150}
				/>
				<ProTable.Column
					title="描述"
					dataIndex="description"
					render={nullRender}
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
					width={180}
				/>
				<ProTable.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
					width={150}
				/>
			</ProTable>
			{visible && (
				<AddMirrorWarehouse
					visible={visible}
					onCancel={() => setVisible(false)}
					clusterId={id}
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
