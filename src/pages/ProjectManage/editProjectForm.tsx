import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Checkbox, Form, notification, Spin } from 'antd';
import { getUserList } from '@/services/user';
import { createProject, getAllocatableNamespace } from '@/services/project';

import pattern from '@/utils/pattern';
import { formItemLayout618 } from '@/utils/const';
import { EditProjectFormProps, FieldValues } from './project';
import { filtersProps } from '@/types/comment';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';

const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const { confirm } = Modal;
export default function EditProjectForm(
	props: EditProjectFormProps
): JSX.Element {
	const { projectId, onCancel, visible, onRefresh, setRefreshCluster } =
		props;
	const [loading, setLoading] = useState<boolean>(false);
	const [originData, setOriginData] = useState([]);
	const [clusterList, setClusterList] = useState([]);
	const [clusters, setClusters] = useState<string[]>([]);
	const [namespaceList, setNamespaceList] = useState({});
	const [namespaces, setNamespaces] = useState<string[]>([]);
	const [users, setUsers] = useState<filtersProps[]>([]);
	const [form] = Form.useForm();
	// const field = Field.useField();
	useEffect(() => {
		getAllocatableNamespace().then((res) => {
			if (res.success) {
				setLoading(false);
				setOriginData(res.data);
				// setClusterList(res.data);
				if (res.data.length > 0) {
					const listTemp = res.data.map((item: any) => {
						return {
							value: `${item.id}/${item.name}/${
								item.nickname || item.name
							}`,
							label: item.nickname
						};
					});
					setClusterList(listTemp);
				} else {
					setOriginData([]);
					setClusterList([]);
					setNamespaceList({});
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
		getUserList({ keyword: '' }).then((res) => {
			console.log(res);
			if (res.success) {
				const list = res.data
					.filter((item: any) => {
						if (!item.userRoleList) return item;
						if (
							item.userRoleList?.every((i: any) => i.roleId !== 1)
						) {
							return item;
						}
					})
					.map((item: any) => {
						return {
							label: item.aliasName || item.userName,
							value: item.userName
						};
					});
				setUsers(list);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	useEffect(() => {
		if (originData.length > 0) {
			const obj = {};
			clusters.map((item) => {
				const [clusterId, clusterName, clusterNickname] =
					item.split('/');
				const current: any = originData.find(
					(o: any) => clusterId === o.id
				);
				obj[`${current.name}/${current.nickname}`] =
					current.namespaceList;
			});
			setNamespaceList(obj);
		}
	}, [clusters]);
	const onOk = () => {
		form.validateFields().then((values) => {
			if (namespaces.length === 0) {
				confirm({
					title: '操作确认',
					content:
						'请注意，当前项目没有接入命名空间，会导致无法绑定该集群！',
					onOk: () => {
						const clusterListTemp = clusters.map((item) => {
							const [clusterId, clusterName] = item.split('/');
							return {
								id: clusterId,
								namespaceList: namespaces
									.filter((i) => {
										const [
											name,
											aliasName,
											clusterNameTemp
										] = i.split('/');
										if (clusterNameTemp === clusterName)
											return i;
									})
									.map((i) => {
										const [name, aliasName] = i.split('/');
										return {
											name: name,
											aliasName:
												aliasName === 'null'
													? null
													: aliasName
										};
									})
							};
						});
						const sendData: FieldValues = {
							name: values.name,
							aliasName: values.aliasName,
							user: values.user || '',
							description: values.description,
							clusterList: clusterListTemp
						};
						onCancel();
						createProject(sendData)
							.then((res) => {
								if (res.success) {
									notification.success({
										message: '成功',
										description: '项目创建成功'
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
			} else {
				const clusterListTemp = clusters.map((item) => {
					const [clusterId, clusterName] = item.split('/');
					return {
						id: clusterId,
						namespaceList: namespaces
							.filter((i) => {
								const [name, aliasName, clusterNameTemp] =
									i.split('/');
								if (clusterNameTemp === clusterName) return i;
							})
							.map((i) => {
								const [name, aliasName] = i.split('/');
								return {
									name: name,
									aliasName:
										aliasName === 'null' ? null : aliasName
								};
							})
					};
				});
				const sendData: FieldValues = {
					name: values.name,
					aliasName: values.aliasName,
					user: values.user || '',
					description: values.description,
					clusterList: clusterListTemp
				};
				onCancel();
				createProject(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '项目创建成功'
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
	const onChange = (selectedItems: CheckboxValueType[], type: string) => {
		if (type === 'cluster') {
			setClusters(selectedItems as string[]);
		} else {
			setNamespaces(selectedItems as string[]);
		}
	};
	return (
		<Modal
			visible={visible}
			title={projectId ? '编辑项目' : '创建项目'}
			onCancel={onCancel}
			onOk={onOk}
			width={670}
			okText="确定"
			cancelText="取消"
		>
			<Form {...formItemLayout618} form={form} labelAlign="left">
				<FormItem
					label="项目名称"
					required
					name="aliasName"
					rules={[
						{ required: true, message: '请输入项目名称' },
						{
							max: 80,
							message: '输入名称，且最大长度不超过80个字符'
						},
						{
							pattern: new RegExp(pattern.projectAliasName),
							message: '请输入名称，且最大长度不超过20个字符'
						}
					]}
				>
					<Input />
				</FormItem>
				<FormItem
					label="英文简称"
					name="name"
					rules={[
						{ required: true, message: '请输入项目名称' },
						{
							pattern: new RegExp(pattern.projectName),
							message:
								'由小写字母数字及“-”组成，且必须以小写字母开头及不能以“-”结尾的2-40个字符'
						}
					]}
					required
				>
					<Input disabled={projectId ? true : false} />
				</FormItem>
				<FormItem label="备注" name="description">
					<Input />
				</FormItem>
				<FormItem label="绑定项目管理员" name="user">
					<Select
						dropdownMatchSelectWidth={false}
						allowClear={true}
						style={{ width: '100%' }}
					>
						{users.map((item: filtersProps) => {
							return (
								<Option value={item.value} key={item.value}>
									{item.label}
								</Option>
							);
						})}
					</Select>
				</FormItem>
				<FormItem label="绑定集群/命名分区">
					<Spin
						tip="加载中，请稍后"
						size="default"
						spinning={loading}
					>
						<div className="role-management-content">
							<div className="role-management-cluster">
								<div className="role-management-title">
									集群
								</div>
								<div className="role-management-check-content">
									<CheckboxGroup
										value={clusters}
										options={clusterList}
										onChange={(selectedItems) =>
											onChange(selectedItems, 'cluster')
										}
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
												const [name, nickname] =
													key.split('/');
												return (
													<div key={key}>
														<div className="role-management-label">
															{nickname}:
														</div>
														<div className="role-management-checkout-content">
															{namespaceList[
																key
															].map(
																(
																	namespace: any
																) => {
																	return (
																		<>
																			<Checkbox
																				key={
																					namespace.name
																				}
																				value={`${
																					namespace.name
																				}/${
																					namespace.aliasName ||
																					'null'
																				}/${key}`}
																			>
																				{namespace.aliasName ||
																					namespace.name}
																			</Checkbox>
																			<br />
																		</>
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
					</Spin>
				</FormItem>
			</Form>
		</Modal>
	);
}
