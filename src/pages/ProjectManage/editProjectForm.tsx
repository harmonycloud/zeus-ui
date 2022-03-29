import React, { useState, useEffect } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Select,
	Loading,
	Checkbox,
	Message
} from '@alicloud/console-components';

import messageConfig from '@/components/messageConfig';

import { getClusters } from '@/services/common';
import { getUserList } from '@/services/user';
import { createProject } from '@/services/project';
import { userProps } from '../UserManage/user';

import pattern from '@/utils/pattern';
import { formItemLayout619 } from '@/utils/const';
import { EditProjectFormProps, FieldValues } from './project';

const FormItem = Form.Item;
const Option = Select.Option;
const { Group: CheckboxGroup } = Checkbox;
export default function EditProjectForm(
	props: EditProjectFormProps
): JSX.Element {
	const { projectId, onCancel, visible, onRefresh } = props;
	const [loading, setLoading] = useState<boolean>(false);
	const [originData, setOriginData] = useState([]);
	const [clusterList, setClusterList] = useState([]);
	const [clusters, setClusters] = useState<string[]>([]);
	const [namespaceList, setNamespaceList] = useState({});
	const [namespaces, setNamespaces] = useState<string[]>([]);
	const [users, setUsers] = useState<userProps[]>([]);
	const field = Field.useField();
	useEffect(() => {
		getClusters({ detail: true }).then((res) => {
			if (res.success) {
				setLoading(false);
				if (res.data.length !== 0) {
					setOriginData(res.data);
					const listTemp = res.data.map((item: any) => {
						return {
							value: `${item.id}/${item.name}`,
							label: item.name
						};
					});
					setClusterList(listTemp);
				} else {
					setOriginData([]);
					setClusterList([]);
					setNamespaceList({});
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		getUserList({ keyword: '' }).then((res) => {
			if (res.success) {
				setUsers(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	useEffect(() => {
		if (originData.length > 0) {
			const obj = {};
			clusters.map((item) => {
				const [clusterId, clusterName] = item.split('/');
				const current: any = originData.find(
					(o: any) => clusterId === o.id
				);
				obj[current.name] = current.namespaceList;
			});
			setNamespaceList(obj);
		}
	}, [clusters]);
	const onOk = () => {
		console.log(field.getValues());
		console.log(clusters);
		console.log(namespaces);
		field.validate((errors) => {
			if (errors) return;
			const values: FieldValues = field.getValues();
			const clusterListTemp = clusters.map((item) => {
				const [clusterId, clusterName] = item.split('/');
				return {
					id: clusterId,
					namespaceList: namespaces
						.filter((i) => {
							const [name, clusterNameTemp] = i.split('/');
							if (clusterNameTemp === clusterName) return i;
						})
						.map((i) => {
							const [name] = i.split('/');
							return {
								name: name
							};
						})
				};
			});
			console.log(clusterListTemp);
			const sendData: FieldValues = {
				name: values.name,
				aliasName: values.aliasName,
				user: values.user || 'admin',
				description: values.description,
				clusterList: clusterListTemp
			};
			console.log(sendData);
			onCancel();
			createProject(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '项目创建成功')
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				})
				.finally(() => {
					onRefresh();
				});
		});
	};
	const onChange = (selectedItems: string[], type: string) => {
		if (type === 'cluster') {
			setClusters(selectedItems);
		} else {
			setNamespaces(selectedItems);
		}
	};
	return (
		<Dialog
			visible={visible}
			title={projectId ? '编辑项目' : '创建项目'}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: '670px' }}
		>
			<Form {...formItemLayout619} field={field}>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="项目名称"
					required
					requiredMessage="请输入项目名称"
					pattern={pattern.projectAliasName}
					patternMessage="请输入名称，且最大长度不超过80个字符"
				>
					<Input name="aliasName" />
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="英文简称"
					required
					requiredMessage="请输入英文名称"
					pattern={pattern.projectName}
					patternMessage="由小写字母数字及“-”组成，且必须以小写字母开头及不能以“-”结尾的2-40个字符"
				>
					<Input name="name" disabled={projectId ? true : false} />
				</FormItem>
				<FormItem label="备注">
					<Input name="description" />
				</FormItem>
				<FormItem label="绑定项目管理员">
					<Select
						name="user"
						style={{ width: '100%' }}
						defaultValue={users[0]?.userName}
					>
						{users.map((item: userProps) => {
							return (
								<Option
									value={item.userName}
									key={item.userName}
								>
									{item.aliasName}
								</Option>
							);
						})}
					</Select>
				</FormItem>
				<FormItem label="绑定集群/命名分区">
					<Loading
						tip="加载中，请稍后"
						size="medium"
						visible={loading}
					>
						<div className="role-management-content">
							<div className="role-management-cluster">
								<div className="role-management-title">
									集群
								</div>
								<div className="role-management-check-content">
									<CheckboxGroup
										value={clusters}
										dataSource={clusterList}
										onChange={(selectedItems) =>
											onChange(selectedItems, 'cluster')
										}
										direction="ver"
									/>
								</div>
							</div>
							<div className="role-management-namespace">
								<div className="role-management-title">
									命名空间
								</div>
								<div className="role-management-check-content">
									<CheckboxGroup
										value={namespaces}
										onChange={(selectedItems) =>
											onChange(selectedItems, 'namespace')
										}
									>
										{Object.keys(namespaceList).map(
											(key) => {
												return (
													<div key={key}>
														<div className="role-management-label">
															{key}:
														</div>
														<div className="role-management-checkout-content">
															{namespaceList[
																key
															].map(
																(
																	namespace: any
																) => {
																	return (
																		<Checkbox
																			key={
																				namespace.name
																			}
																			value={`${namespace.name}/${key}`}
																		>
																			{namespace.aliasName ||
																				namespace.name}
																		</Checkbox>
																	);
																}
															)}
														</div>
													</div>
												);
											}
										)}
									</CheckboxGroup>
								</div>
							</div>
						</div>
					</Loading>
				</FormItem>
			</Form>
		</Dialog>
	);
}