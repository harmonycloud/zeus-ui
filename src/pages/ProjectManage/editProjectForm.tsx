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
import { EditProjectFormProps } from './project';
import { formItemLayout619 } from '@/utils/const';
import pattern from '@/utils/pattern';
import { getClusters } from '@/services/common';
import messageConfig from '@/components/messageConfig';

const FormItem = Form.Item;
const Option = Select.Option;
const { Group: CheckboxGroup } = Checkbox;
export default function EditProjectForm(
	props: EditProjectFormProps
): JSX.Element {
	const { projectId, onCancel, visible, onCreate } = props;
	const [loading, setLoading] = useState<boolean>(false);
	const [originData, setOriginData] = useState([]);
	const [clusterList, setClusterList] = useState([]);
	const [clusters, setClusters] = useState<string[]>([]);
	const [namespaceList, setNamespaceList] = useState({});
	const [namespaces, setNamespaces] = useState<string[]>([]);
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
	}, []);
	useEffect(() => {
		// if (data?.clusterList) {
		// 	const clustersTemp = data.clusterList.map(
		// 		(item: any) => `${item.id}/${item.name}`
		// 	);
		// 	setClusters(clustersTemp);
		// 	const namespacesTemp: string[] = [];
		// 	data.clusterList.map((item: any) => {
		// 		item.namespaceList.map((i: any) => {
		// 			namespacesTemp.push(`${i.name}/${item.name}`);
		// 		});
		// 	});
		// 	setNamespaces(namespacesTemp);
		// }
	}, [originData]);
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
		console.log('ok');
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
					label="英文简称"
					required
					requiredMessage="请输入英文名称"
					pattern={pattern.projectName}
					patternMessage="由小写字母数字及“-”组成，且必须以小写字母开头及不能以“-”结尾的2-40个字符"
				>
					<Input name="name" disabled={projectId ? true : false} />
				</FormItem>
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
				<FormItem label="备注">
					<Input name="description" />
				</FormItem>
				<FormItem label="绑定项目管理员">
					<Select style={{ width: '100%' }}></Select>
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
