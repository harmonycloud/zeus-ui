import React, { useEffect, useState } from 'react';
import {
	Modal,
	Form,
	Input,
	Radio,
	Select,
	notification,
	RadioChangeEvent
} from 'antd';
import { connect } from 'react-redux';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { createNamespace } from '@/services/common';
import { bingNamespace, getAllocatableNamespace } from '@/services/project';
import { formItemLayout618 } from '@/utils/const';
import { clusterType } from '@/types';
import { AddNamespaceProps } from './projectDetail';

const list = [
	{
		value: 'create',
		label: '创建命名空间'
	},
	{
		value: 'access',
		label: '接入命名空间'
	}
];
const FormItem = Form.Item;
const { Group: RadioGroup } = Radio;
const Option = Select.Option;
function AddNamespace(props: AddNamespaceProps): JSX.Element {
	const {
		visible,
		onCancel,
		onRefresh,
		setRefreshCluster,
		projectId,
		projectAliasName
	} = props;
	const [source, setSource] = useState<string>('create');
	const [clusterList, setClusterList] = useState<clusterType[]>([]);
	const [currentCluster, setCurrentCluster] = useState<clusterType>();
	const [namespaceList, setNamespaceList] = useState([]);
	const [form] = Form.useForm();
	useEffect(() => {
		getAllocatableNamespace().then((res) => {
			if (res.success) {
				setClusterList(res.data);
				if (res.data.length > 0) {
					setNamespaceList(res.data[0].namespaceList || []);
					setCurrentCluster(res.data[0]);
				} else {
					setNamespaceList([]);
					setCurrentCluster(undefined);
				}
			} else {
				setClusterList([]);
				setNamespaceList([]);
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	useEffect(() => {
		clusterList.map((item: clusterType) => {
			if (item.id === currentCluster?.id) {
				setNamespaceList(item.namespaceList || []);
				form.setFieldsValue({
					namespace: ''
				});
			}
		});
	}, [currentCluster]);
	const onOk = () => {
		form.validateFields().then((values) => {
			onCancel();
			if (source === 'access') {
				const currentNamespace: any = namespaceList.find(
					(item: any) => item.name === values.namespace
				);
				const sendData = {
					clusterId: values.clusterId,
					name: values.namespace,
					projectId: values.projectId,
					aliasName: currentNamespace?.aliasName || null
				};
				bingNamespace(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '命名空间接入成功'
							});
							setRefreshCluster(true);
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						onRefresh();
					});
			} else {
				const sendData = {
					clusterId: values.clusterId,
					name: values.name,
					projectId: values.projectId,
					aliasName: values.aliasName
				};
				createNamespace(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '命名空间新建成功'
							});
							setRefreshCluster(true);
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						onRefresh();
					});
			}
		});
	};
	const handleChange = (value: string) => {
		console.log(value);
		const t = clusterList.find((item) => item.id === value);
		setCurrentCluster(t);
	};
	return (
		<Modal
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			title="新增/接入"
			width={550}
			okText="确定"
			cancelText="取消"
		>
			<Form {...formItemLayout618} labelAlign="left" form={form}>
				<FormItem
					label="选择操作:"
					required
					name="source"
					rules={[
						{
							required: true,
							message: '选择操作必填'
						}
					]}
					initialValue={'create'}
				>
					<RadioGroup
						options={list}
						value={source}
						onChange={(e: RadioChangeEvent) => {
							setSource(e.target.value as string);
						}}
					/>
				</FormItem>
				{source === 'create' && (
					<FormItem
						label="命名空间名称:"
						name="aliasName"
						required
						rules={[
							{
								required: true,
								message: '命名空间名称必填'
							},
							{
								max: 64,
								message: '请输入名称，且最大长度不超过64个字符'
							}
						]}
					>
						<Input id="aliasName" />
					</FormItem>
				)}
				{source === 'create' && (
					<FormItem
						label="英文简称:"
						required
						name="name"
						rules={[
							{
								required: true,
								message: '英文简称必填'
							},
							{
								pattern: new RegExp(
									'^[a-z][a-z0-9-]{0,38}[a-z0-9]$'
								),
								message:
									'命名空间是由小写字母数字及“-”组成，且以小写字母开头和结尾，不能以“-”结尾的2-40个字符'
							}
						]}
					>
						<Input id="name" />
					</FormItem>
				)}
				<FormItem
					label="绑定项目"
					name="projectId"
					initialValue={projectId}
				>
					<Select disabled={true} style={{ width: '100%' }}>
						<Option value={projectId}>{projectAliasName}</Option>
					</Select>
				</FormItem>
				<FormItem
					label="绑定集群"
					required
					name="clusterId"
					rules={[
						{
							required: true,
							message: '英文简称必填'
						}
					]}
				>
					<Select
						value={currentCluster?.id}
						onChange={handleChange}
						style={{ width: '100%' }}
						dropdownMatchSelectWidth={false}
					>
						{clusterList.map((item: clusterType) => {
							return (
								<Option key={item.id} value={item.id}>
									{item.nickname}
								</Option>
							);
						})}
					</Select>
				</FormItem>
				{source === 'access' && (
					<FormItem
						label="选择命名空间"
						name="namespace"
						required
						rules={[
							{
								required: true,
								message: '请选择命名空间'
							}
						]}
					>
						<Select
							style={{ width: '100%' }}
							dropdownMatchSelectWidth={false}
						>
							{namespaceList?.map((item: any) => {
								return (
									<Option key={item.name} value={item.name}>
										{item.aliasName || item.name}
									</Option>
								);
							})}
						</Select>
					</FormItem>
				)}
			</Form>
		</Modal>
	);
}
const mapStateToProps = () => ({});
export default connect(mapStateToProps, { setRefreshCluster })(AddNamespace);
