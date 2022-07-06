import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Button, notification, Modal } from 'antd';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import { useHistory, useParams } from 'react-router';
import { getParamsTemps, deleteParamsTemp } from '@/services/template';
import { ParamterTemplateItem } from '../detail';
import { Key } from 'antd/lib/table/interface';

interface ParamterTemplateProps {
	type: string;
	chartVersion: string;
	middlewareName: string;
}
interface paramsProps {
	name: string;
	aliasName: string;
	namespace: string;
}
const { confirm } = Modal;
const LinkButton = Actions.LinkButton;
const ParamterTemplate = (props: ParamterTemplateProps) => {
	const { type, chartVersion, middlewareName } = props;
	const [originData, setOriginData] = useState([]);
	const [dataSource, setDataSource] = useState([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const history = useHistory();
	const params: paramsProps = useParams();
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		setSelectedRowKeys([]);
		getParamsTemps({ type: type }).then((res) => {
			if (res.success) {
				setOriginData(res.data);
				setDataSource(res.data);
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
			<>
				<Button
					onClick={() => {
						history.push(
							`/serviceList/${params.name}/${params.aliasName}/paramterSetting/template/${middlewareName}/${type}/${chartVersion}/${params.namespace}`
						);
					}}
					type="primary"
				>
					新建
				</Button>
				{selectedRowKeys.length === 2 && (
					<Button
						onClick={() => {
							history.push(
								`/serviceList/${params.name}/${params.aliasName}/paramterSetting/compareTemplate/${type}/${chartVersion}/${selectedRowKeys[0]}/${selectedRowKeys[1]}/${params.namespace}/compare`
							);
						}}
						type="default"
					>
						对比
					</Button>
				)}
				{selectedRowKeys.length > 0 && (
					<Button
						onClick={() => {
							const sendData = {
								type,
								uids: selectedRowKeys.join(',')
							};
							deleteTemp(sendData);
						}}
						type="primary"
						danger
					>
						删除
					</Button>
				)}
				{selectedRowKeys.length > 0 && (
					<Button
						type="default"
						onClick={() => {
							setSelectedRowKeys([]);
						}}
					>
						取消
					</Button>
				)}
			</>
		)
	};
	const deleteTemp = (sendData: { type: string; uids: string }) => {
		confirm({
			title: '操作确认',
			content: '请确认是否删除所选择自定义参数模板',
			onOk: () => {
				return deleteParamsTemp(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '模板删除成功'
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
		value: string,
		record: ParamterTemplateItem,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						history.push(
							`/serviceList/${params.name}/${params.aliasName}/paramterSetting/useTemplate/${middlewareName}/${type}/${chartVersion}/${record.uid}/${params.namespace}`
						);
					}}
					disabled={selectedRowKeys.length > 0}
				>
					<span
						title={
							selectedRowKeys.length > 0 ? '请取消勾选后操作' : ''
						}
					>
						使用
					</span>
				</LinkButton>
				<LinkButton
					onClick={() => {
						history.push(
							`/serviceList/${params.name}/${params.aliasName}/paramterSetting/template/${middlewareName}/${type}/${chartVersion}/${record.uid}/${record.name}/${params.namespace}`
						);
					}}
					disabled={selectedRowKeys.length > 0}
				>
					<span
						title={
							selectedRowKeys.length > 0 ? '请取消勾选后操作' : ''
						}
					>
						编辑
					</span>
				</LinkButton>
				<LinkButton
					onClick={() => {
						const sendData = {
							type: record.type,
							uids: record.uid
						};
						deleteTemp(sendData);
					}}
					disabled={selectedRowKeys.length > 0}
				>
					<span
						title={
							selectedRowKeys.length > 0 ? '请取消勾选后操作' : ''
						}
					>
						删除
					</span>
				</LinkButton>
			</Actions>
		);
	};
	const handleSearch = (value: string) => {
		const list = originData.filter((item: any) =>
			item.name.includes(value)
		);
		setDataSource(list);
	};
	const onChange = (selectedRowKeys: Key[]) => {
		setSelectedRowKeys(selectedRowKeys);
	};
	return (
		<ProTable
			dataSource={dataSource}
			rowKey="uid"
			operation={Operation}
			search={{
				onSearch: handleSearch,
				placeholder: '请输入关键词搜索'
			}}
			rowSelection={{
				onChange: onChange,
				selectedRowKeys: selectedRowKeys
			}}
		>
			<ProTable.Column
				title="模板名称"
				dataIndex="name"
				ellipsis={true}
				fixed="left"
				width={150}
			/>
			<ProTable.Column
				title="模板描述"
				dataIndex="description"
				ellipsis={true}
			/>
			<ProTable.Column
				title="创建时间"
				dataIndex="createTime"
				width={180}
				sorter={(a: ParamterTemplateItem, b: ParamterTemplateItem) =>
					moment(a.createTime).unix() - moment(b.createTime).unix()
				}
			/>
			<ProTable.Column
				title="操作"
				dataIndex="action"
				width={180}
				render={actionRender}
			/>
		</ProTable>
	);
};
export default ParamterTemplate;
