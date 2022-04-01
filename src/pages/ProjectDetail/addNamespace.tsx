import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Radio,
	Select,
	Message
} from '@alicloud/console-components';

import messageConfig from '@/components/messageConfig';
import storage from '@/utils/storage';
import { connect } from 'react-redux';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { createNamespace } from '@/services/common';
import { bingNamespace, getAllocatableNamespace } from '@/services/project';
import { formItemLayout618 } from '@/utils/const';
import { clusterType } from '@/types';
import { AddNamespaceFieldValues, AddNamespaceProps } from './projectDetail';
import { ProjectItem } from '../ProjectManage/project';

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
	const { visible, onCancel, onRefresh, setRefreshCluster } = props;
	const [source, setSource] = useState<string>('create');
	const [clusterList, setClusterList] = useState<clusterType[]>([]);
	const [currentCluster, setCurrentCluster] = useState<string>('');
	const [namespaceList, setNamespaceList] = useState([]);
	const [project] = useState<ProjectItem>(
		JSON.parse(storage.getLocal('project'))
	);
	const field = Field.useField();
	useEffect(() => {
		getAllocatableNamespace({ projectId: project.projectId }).then(
			(res) => {
				if (res.success) {
					setClusterList(res.data);
					if (res.data.length > 0) {
						setNamespaceList(res.data[0].namespaceList || []);
						setCurrentCluster(res.data[0].id);
					} else {
						setNamespaceList([]);
						setCurrentCluster('');
					}
				} else {
					setClusterList([]);
					setNamespaceList([]);
					Message.show(messageConfig('error', '失败', res));
				}
			}
		);
	}, []);
	useEffect(() => {
		clusterList.map((item: clusterType) => {
			if (item.id === currentCluster) {
				setNamespaceList(item.namespaceList || []);
			}
		});
	}, [currentCluster]);
	const onOk = () => {
		field.validate((errors) => {
			if (errors) return;
			const values: AddNamespaceFieldValues = field.getValues();
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
							Message.show(
								messageConfig(
									'success',
									'成功',
									'命名空间接入成功'
								)
							);
							setRefreshCluster(true);
						} else {
							Message.show(messageConfig('error', '失败', res));
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
							Message.show(
								messageConfig(
									'success',
									'成功',
									'命名空间新建成功'
								)
							);
							setRefreshCluster(true);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						onRefresh();
					});
			}
		});
	};
	const handleChange = (value: string) => {
		setCurrentCluster(value);
	};
	return (
		<Dialog
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			title="新增/接入"
			style={{ width: '550px' }}
		>
			<Form {...formItemLayout618} field={field}>
				<FormItem
					label="选择操作:"
					required
					requiredMessage="选择操作必填"
				>
					<RadioGroup
						name="source"
						dataSource={list}
						value={source}
						onChange={(value: string | number | boolean) => {
							setSource(value as string);
						}}
					/>
				</FormItem>
				{source === 'create' && (
					<FormItem
						label="命名空间名称:"
						required
						requiredMessage="命名空间名称必填"
						maxLength={64}
						minmaxLengthMessage="请输入名称，且最大长度不超过64个字符"
					>
						<Input id="aliasName" name="aliasName" />
					</FormItem>
				)}
				{source === 'create' && (
					<FormItem
						label="英文简称:"
						required
						requiredMessage="英文简称必填"
						pattern={'^[a-z][a-z0-9-]{0,61}[a-z0-9]$'}
						patternMessage={
							'命名空间是由小写字母数字及“-”组成，且以小写字母开头和结尾，不能以“-”结尾的2-63个字符'
						}
					>
						<Input id="name" name="name" />
					</FormItem>
				)}
				<FormItem label="绑定项目">
					<Select
						name="projectId"
						value={project.projectId}
						disabled={true}
						style={{ width: '100%' }}
					>
						<Option value={project.projectId}>
							{project.aliasName}
						</Option>
					</Select>
				</FormItem>
				<FormItem
					label="绑定集群"
					required
					requiredMessage="英文简称必填"
				>
					<Select
						name="clusterId"
						value={currentCluster}
						onChange={handleChange}
						style={{ width: '100%' }}
					>
						{clusterList.map((item: clusterType) => {
							return (
								<Option key={item.id} value={item.id}>
									{item.name}
								</Option>
							);
						})}
					</Select>
				</FormItem>
				{source === 'access' && (
					<FormItem
						label="选择命名空间"
						required
						requiredMessage="请选择命名空间"
					>
						<Select name="namespace" style={{ width: '100%' }}>
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
		</Dialog>
	);
}
const mapStateToProps = () => ({});
export default connect(mapStateToProps, { setRefreshCluster })(AddNamespace);
