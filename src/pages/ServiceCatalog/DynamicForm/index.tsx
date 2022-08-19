import React, { useEffect, useState } from 'react';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { Input, Select, Button, Form, Result, notification } from 'antd';
import FormBlock from '@/components/FormBlock';
import { renderFormItem } from '@/components/renderFormItem';
import { getDynamicFormData } from '@/services/middleware';
import { postMiddleware } from '@/services/middleware';
import pattern from '@/utils/pattern';
import { getMirror } from '@/services/common';

import {
	CreateProps,
	DynamicSendDataParams,
	DynamicCreateValueParams
} from '../catalog';
import { StoreState } from '@/types';
import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import { getProjectNamespace } from '@/services/project';
import { middlewareDetailProps } from '@/types/comment';
const { Item: FormItem } = Form;

function DynamicForm(props: CreateProps): JSX.Element {
	const {
		cluster: globalCluster,
		namespace: globalNamespace,
		project
	} = props.globalVar;
	const {
		params: { chartName, chartVersion, aliasName }
	} = props.match;
	const [dataSource, setDataSource] = useState<any>();
	const [capabilities, setCapabilities] = useState<string[]>([]);
	// * 是否点击提交跳转至结果页
	const [commitFlag, setCommitFlag] = useState<boolean>(false);
	// * 发布成功
	const [successFlag, setSuccessFlag] = useState<boolean>(false);
	// * 发布失败
	const [errorFlag, setErrorFlag] = useState<boolean>(false);
	// * 创建返回的服务名称
	const [createData, setCreateData] = useState<middlewareDetailProps>();
	// * 创建失败返回的失败信息
	const [errorData, setErrorData] = useState<string>('');
	const [mirrorList, setMirrorList] = useState<any[]>([]);
	// * 当导航栏的命名空间为全部时
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]);
	const history = useHistory();
	const [form] = Form.useForm();
	useEffect(() => {
		if (
			JSON.stringify(props.globalVar.cluster) !== '{}' &&
			JSON.stringify(props.globalVar.namespace) !== '{}'
		) {
			const sendData = {
				clusterId: globalCluster.id,
				chartName: chartName,
				chartVersion: chartVersion
			};
			getDynamicFormData(sendData).then((res) => {
				if (res.success) {
					const formatData = processData(res.data.questions);
					setDataSource(formatData);
					setCapabilities(res.data.capabilities);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
			getMirror({
				clusterId: globalCluster.id
			}).then((res) => {
				if (res.success) {
					setMirrorList(res.data.list);
				}
			});
		}
	}, [props]);

	useEffect(() => {
		if (JSON.stringify(project) !== '{}' && globalNamespace.name === '*') {
			getProjectNamespace({ projectId: project.projectId }).then(
				(res) => {
					console.log(res);
					if (res.success) {
						const list = res.data.filter(
							(item: NamespaceItem) =>
								item.clusterId === globalCluster.id
						);
						setNamespaceList(list);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				}
			);
		}
	}, [project, globalNamespace]);

	const processData = (array: any) => {
		const obj = {};
		array.forEach((item: any) => {
			obj[item.group] = [];
		});
		array.forEach((item: any) => {
			if (Object.keys(obj).includes(item.group)) {
				obj[item.group].push(item);
			}
		});
		return obj;
	};

	const childrenRender = (values: any) => {
		if (values) {
			const keys = Object.keys(values);
			return (
				<div>
					{keys.map((item) => {
						return (
							<FormBlock key={item} title={item}>
								<div className="w-50">
									<ul className="form-layout">
										{values[item].map((formItem: any) => {
											return (
												<React.Fragment
													key={formItem.variable}
												>
													{renderFormItem(
														formItem,
														form,
														globalCluster,
														globalNamespace
													)}
												</React.Fragment>
											);
										})}
									</ul>
								</div>
							</FormBlock>
						);
					})}
				</div>
			);
		}
	};

	const handleSubmit = () => {
		form.validateFields().then((values: DynamicCreateValueParams) => {
			const sendData: DynamicSendDataParams = {
				clusterId: globalCluster.id,
				namespace:
					globalNamespace.name === '*'
						? values.namespace
						: globalNamespace.name,
				type: chartName,
				chartName: chartName,
				chartVersion: chartVersion,
				version: values.version,
				name: values.name,
				aliasName: values.aliasName,
				description: values.description,
				labels: values.labels,
				capabilities: capabilities
			};
			// * 主机亲和特殊处理
			if (values.nodeAffinity) {
				if (values.nodeAffinity.length) {
					sendData.nodeAffinity = values.nodeAffinity.map((item) => {
						return {
							label: item.label,
							required: item.required,
							namespace: globalNamespace.name
						};
					});
				} else {
					notification.error({
						message: '失败',
						description: '请选择主机亲和。'
					});
				}
			}
			// * 删除动态表单中多余的主机亲和相关的值
			const dynamicValues = {};
			for (const index in values) {
				if (
					index !== 'nodeAffinityLabel' &&
					index !== 'nodeAffinityForce' &&
					index !== 'nodeAffinity' &&
					index !== 'name' &&
					index !== 'aliasName' &&
					index !== 'annotations' &&
					index !== 'tolerations' &&
					index !== 'tolerationsLabels'
				) {
					if (index === 'image.repository') {
						dynamicValues['mirrorImageId'] = mirrorList.find(
							(item) => item.address === values[index]
						)
							? mirrorList
									.find(
										(item) => item.address === values[index]
									)
									.id.toString()
							: '';
					}
					dynamicValues[index] = values[index];
					if (index === 'storageClassName') {
						dynamicValues['storageClassName'] =
							values['storageClassName'].split('/')[0];
					}
				}
			}
			sendData.dynamicValues = dynamicValues;
			// * 主机容忍特殊处理
			if (values.tolerations) {
				if (values.tolerations.length) {
					sendData.tolerations = values.tolerations.map((item) => {
						return item.label;
					});
				} else {
					notification.error({
						message: '失败',
						description: '请选择主机容忍。'
					});
					return;
				}
			}
			setCommitFlag(true);
			postMiddleware(sendData).then((res) => {
				if (res.success) {
					setCreateData(res.data);
					setSuccessFlag(true);
					setErrorFlag(false);
					setCommitFlag(false);
				} else {
					setErrorData(res.errorMsg);
					setSuccessFlag(false);
					setErrorFlag(true);
					setCommitFlag(false);
				}
			});
		});
	};
	// * 结果页相关
	if (commitFlag) {
		return (
			<ProPage>
				<ProHeader />
				<ProContent>
					<Result
						title="发布中"
						extra={
							<Button
								type="primary"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}`
									});
								}}
							>
								返回列表
							</Button>
						}
					/>
				</ProContent>
			</ProPage>
		);
	}
	if (successFlag) {
		return (
			<ProPage>
				<ProHeader />
				<ProContent>
					<Result
						status="success"
						title="发布成功"
						extra={[
							<Button
								key="list"
								type="primary"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}`
									});
								}}
							>
								返回列表
							</Button>,
							<Button
								key="detail"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}/basicInfo/${createData?.name}/${chartName}/${chartVersion}/${createData?.namespace}`
									});
								}}
							>
								查看详情
							</Button>
						]}
					/>
				</ProContent>
			</ProPage>
		);
	}

	if (errorFlag) {
		return (
			<ProPage>
				<ProHeader />
				<ProContent>
					<Result
						status="error"
						title="发布失败"
						subTitle={errorData}
						extra={
							<Button
								type="primary"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}`
									});
								}}
							>
								返回列表
							</Button>
						}
					/>
				</ProContent>
			</ProPage>
		);
	}
	return (
		<ProPage>
			<ProHeader
				title={`发布${chartName}服务`}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Form form={form}>
					{globalNamespace.name === '*' && (
						<FormBlock title="选择命名空间">
							<div className="w-50">
								<ul className="form-layout">
									<li className="display-flex flex-column">
										<label
											className="dynamic-form-name"
											style={{ paddingLeft: 8 }}
										>
											<span className="ne-required">
												命名空间
											</span>
										</label>
										<div className="form-content">
											<FormItem
												rules={[
													{
														required: true,
														message:
															'请输入命名空间'
													}
												]}
												name="namespace"
											>
												<Select
													placeholder="请选择命名空间"
													style={{ width: '390px' }}
													dropdownMatchSelectWidth={
														false
													}
												>
													{namespaceList.map(
														(item) => {
															return (
																<Select.Option
																	key={
																		item.name
																	}
																	value={
																		item.name
																	}
																>
																	{
																		item.aliasName
																	}
																</Select.Option>
															);
														}
													)}
												</Select>
											</FormItem>
										</div>
									</li>
								</ul>
							</div>
						</FormBlock>
					)}
					<FormBlock title="基本信息">
						<div className="w-50">
							<ul className="form-layout">
								<li className="display-flex flex-column">
									<label
										className="dynamic-form-name"
										style={{ paddingLeft: 8 }}
									>
										<span className="ne-required">
											服务名称
										</span>
									</label>
									<div className="form-content">
										<FormItem
											rules={[
												{
													required: true,
													message: '请输入服务名称'
												},
												{
													pattern: new RegExp(
														pattern.name
													),
													message:
														'请输入以小写字母开头，小写字母数字及“-”组成的2-24个字符'
												}
											]}
											name="name"
										>
											<Input
												style={{ width: '390px' }}
												placeholder="请输入以小写字母开头，小写字母数字及“-”组成的2-24个字符"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex flex-column">
									<label className="dynamic-form-name">
										<span>显示名称</span>
									</label>
									<div className="form-content">
										<FormItem
											rules={[
												{
													type: 'string',
													min: 2,
													max: 80,
													message:
														'请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符'
												},
												{
													pattern: new RegExp(
														pattern.nickname
													),
													message:
														'请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符'
												}
											]}
											name="aliasName"
										>
											<Input
												style={{ width: '390px' }}
												placeholder="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex  flex-column">
									<label className="dynamic-form-name">
										<span>标签</span>
									</label>
									<div className="form-content">
										<FormItem
											rules={[
												{
													pattern: new RegExp(
														pattern.labels
													),
													message:
														'请输入key=value格式的标签，多个标签以英文逗号分隔'
												}
											]}
											name="labels"
										>
											<Input
												style={{ width: '390px' }}
												placeholder="请输入key=value格式的标签，多个标签以英文逗号分隔"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex  flex-column">
									<label className="dynamic-form-name">
										<span>备注</span>
									</label>
									<div className="form-content">
										<FormItem>
											<Input.TextArea
												style={{ width: '390px' }}
												name="description"
												placeholder="请输入备注信息"
											/>
										</FormItem>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					{childrenRender(dataSource)}
					<div className="dynamic-summit-box">
						<Button
							type="primary"
							style={{ marginRight: 8 }}
							onClick={handleSubmit}
						>
							提交
						</Button>
						<Button onClick={() => window.history.back()}>
							取消
						</Button>
					</div>
				</Form>
			</ProContent>
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(DynamicForm);
