import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Location } from 'history';
import { useParams } from 'react-router';
import { connect } from 'react-redux';
import {
	Form,
	Select,
	Input,
	Button,
	Cascader,
	InputNumber,
	notification
} from 'antd';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { IconFont } from '@/components/IconFont';

import { getServices } from '@/services/ingress';
import pattern from '@/utils/pattern';

import { StoreState } from '@/types/index';
import { getList } from '@/services/serviceList';
import { serviceListItemProps } from '@/pages/ServiceList/service.list';
import { filtersProps } from '@/types/comment';
import { getIngresses } from '@/services/common';
import { addIngress } from '@/services/ingress';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
import storage from '@/utils/storage';

import './index.scss';

const FormItem = Form.Item;
const { Option } = Select;
interface stateProps {
	middlewareName: string;
}
function AddServiceAvailableForm(props: any): JSX.Element {
	const { cluster, namespace, project } = props.globalVar;

	const [exposedWay, setExposedWay] = useState('Ingress');
	const [protocol, setProtocol] = useState(
		exposedWay === 'Ingress' ? 'HTTP' : 'TCP'
	);
	const [selectedInstance, setSelectedInstance] = useState({
		name: '',
		type: ''
	});
	const [services, setServices] = useState([]);
	const [selectedService, setSelectedService] = useState({
		serviceName: '',
		portDetailDtoList: []
	});
	const location: Location<stateProps> = useLocation();
	const params: any = useParams();
	const middlewareName = location?.state?.middlewareName || '';
	const [data, setData] = useState<any[]>([]);
	const [current, setCurrent] = useState<any>();
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	const [httpList, setHttpList] = useState<any[]>([
		{
			serviceName: '',
			servicePort: '',
			domain: '',
			path: '',
			id: Math.random()
		}
	]);
	const [form] = Form.useForm();
	const record = storage.getLocal('availableRecord');
	const [newNamespace, setNewNamespace] = useState<string>();
	const history = useHistory();

	useEffect(() => {
		if (params.middlewareName && !record) {
			setCurrent(params.middlewareName);
			JSON.stringify(namespace) !== '{}' &&
				getIngresses({ clusterId: cluster.id }).then((res) => {
					if (res.success) {
						setIngresses(res.data);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			JSON.stringify(namespace) !== '{}' &&
				getExposedService(
					params.middlewareName,
					params.type,
					params.namespace
				);
			form.setFieldsValue({
				serve: params.middlewareName,
				exposeType: 'Ingress',
				protocol: 'HTTP'
			});
		} else if (record) {
			setCurrent(record.middlewareName);
			setExposedWay(record.exposeType);
			setProtocol(record.protocol);
			form.setFieldsValue({
				serve: record.middlewareName,
				exposeType: record.exposeType,
				protocol: record.protocol
			});
			JSON.stringify(namespace) !== '{}' &&
				getIngresses({ clusterId: cluster.id }).then((res) => {
					if (res.success) {
						setIngresses(res.data);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			JSON.stringify(namespace) !== '{}' &&
				getExposedService(
					record.middlewareNickName
						? record.middlewareNickName
						: record.middlewareName,
					record.middlewareType,
					record.namespace
				);
			if (record.protocol !== 'HTTP') {
				form.setFieldsValue({
					servicePort: record.serviceList[0].servicePort,
					exposePort: Number(record.serviceList[0].exposePort),
					ingressClassName: record.ingressClassName
				});
			} else {
				form.setFieldsValue({
					ingressClassName: record.ingressClassName
				});
				setHttpList(
					record.rules.map((item: any) => {
						return {
							id: Math.random(),
							domain: item.domain,
							serviceName: item.ingressHttpPaths[0].serviceName,
							servicePort: item.ingressHttpPaths[0].servicePort,
							path: item.ingressHttpPaths[0].path
						};
					})
				);
				record.rules.map((item: any, index: number) => {
					form.setFieldsValue({
						['domain' + index]: item.domain,
						['serviceName' + index]:
							item.ingressHttpPaths[0].serviceName,
						['servicePort' + index]:
							item.ingressHttpPaths[0].servicePort,
						['path' + index]: item.ingressHttpPaths[0].path
					});
				});
			}
		} else if (
			JSON.stringify(namespace) !== '{}' &&
			cluster.ingress !== null
		) {
			getList({
				projectId: project.projectId,
				clusterId: cluster.id,
				namespace: namespace.name,
				keyword: ''
			}).then((res) => {
				if (res.success) {
					const list = res.data.map((item: serviceListItemProps) => {
						const result: filtersProps = {
							value: item.chartName,
							label: item.name,
							children: item.serviceList.map((i) => {
								return {
									label: i.aliasName || i.name,
									value: i.name,
									isLeaf: true,
									namespace: i.namespace
								};
							})
						};
						return result;
					});
					setData(list);
					setCurrent(
						middlewareName === ''
							? list[0].children[0].value
							: middlewareName
					);
					form.setFieldsValue({
						serve:
							middlewareName === ''
								? list[0].children[0].value
								: middlewareName
					});
					const listTemp = list.filter((item: filtersProps) => {
						let flag = false;
						item.children &&
							item.children.length > 0 &&
							item.children.map((i: filtersProps) => {
								if (i.value === middlewareName) {
									flag = true;
									return i;
								}
							});
						if (flag) {
							return item;
						}
					});
					const selectedInstanceTemp = {
						name:
							middlewareName === ''
								? list[0].children[0].value
								: middlewareName,
						type:
							middlewareName === ''
								? list[0].value
								: listTemp[0].value
					};
					setSelectedInstance(selectedInstanceTemp);
					setNewNamespace(res.data[0].serviceList[0].namespace);
					getExposedService(
						selectedInstanceTemp.name,
						selectedInstanceTemp.type,
						res.data[0].serviceList[0].namespace
					);
				}
			});
			getIngresses({ clusterId: cluster.id }).then((res) => {
				if (res.success) {
					setIngresses(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
			form.setFieldsValue({ exposeType: 'Ingress', protocol: 'HTTP' });
		}
	}, [namespace, cluster]);

	useEffect(() => {
		return () => {
			storage.getLocal('availableRecord') &&
				storage.removeLocal('availableRecord');
		};
	}, []);
	const onChange = (value: string) => {
		setExposedWay(value);
		value === 'NodePort' ? setProtocol('TCP') : setProtocol('HTTP');
	};

	const addHttpList = () => {
		setHttpList([...httpList, { id: Math.random() }]);
		console.log([...httpList]);
	};
	const copyHttpList = (index: number) => {
		const addItem = httpList[index];
		const list = [
			...httpList,
			{
				...addItem,
				id: Math.random() * 100,
				servicePort: '',
				path: ''
			}
		];
		setHttpList(list);
		list.map((item: any, index: number) => {
			item.serviceName &&
				form.setFieldsValue({
					['serviceName' + index]: item.serviceName
				});
			item.domain &&
				form.setFieldsValue({
					['domain' + index]: item.domain
				});
			item.serviceName &&
				item.domain &&
				form.setFieldsValue({
					['serviceName' + index]: item.serviceName,
					['domain' + index]: item.domain
				});
		});
	};
	const deleteHttpList = (i: number) => {
		const list = httpList.filter((item) => item.id !== i);
		setHttpList(list);
	};

	const onChangeHttp = (value: string, record: any, type: string) => {
		if (type === '') {
			onServiceChange(value);
		}
		const list = httpList.map((item) => {
			if (item.id === record.id) {
				item[type] = value;
				return item;
			} else {
				return item;
			}
		});
		setHttpList(list);
	};

	const onCreate = (values: any) => {
		let old = {};
		let edit = {};
		if (record)
			edit = {
				name: record.name ? record.name : record.middlewareName
			};
		if (record.exposeType === 'Ingress' && record.protocol === 'TCP')
			old = {
				oldServicePort: record.serviceList[0].servicePort,
				oldExposePort: record.serviceList[0].exposePort,
				oldServiceName: record.serviceList[0].serviceName
			};
		const sendData =
			values.protocol === 'HTTP'
				? {
						...edit,
						clusterId: cluster.id,
						namespace: newNamespace,
						exposeType: values.exposeType,
						middlewareName: record
							? record.middlewareNickName
								? record.middlewareNickName
								: record.middlewareName
							: values.selectedInstance.name,
						middlewareType: record
							? record.middlewareType
							: values.selectedInstance.type,
						ingressClassName: values.ingressClassName,
						protocol: values.protocol,
						rules: httpList.map((item) => {
							return {
								domain: item.domain,
								ingressHttpPaths: [
									{
										path: item.path,
										serviceName: item.serviceName,
										servicePort: item.servicePort
									}
								]
							};
						})
				  }
				: {
						...edit,
						clusterId: cluster.id,
						namespace: newNamespace,
						exposeType: values.exposeType,
						middlewareName: record
							? record.middlewareNickName
								? record.middlewareNickName
								: record.middlewareName
							: values.selectedInstance.name,
						middlewareType: record
							? record.middlewareType
							: values.selectedInstance.type,
						ingressClassName: values.ingressClassName,
						protocol: values.protocol,
						serviceList: [
							{
								exposePort: values.exposePort,
								serviceName: values.serviceName,
								servicePort: values.servicePort,
								targetPort:
									values.selectedService.portDetailDtoList[0]
										.targetPort,
								...old
							}
						]
				  };
		if (params.middlewareName) {
			sendData.middlewareName = params.middlewareName;
			sendData.middlewareType = params.type;
			sendData.namespace = params.namespace;
		}
		if (record) {
			sendData.namespace = record.namespace;
		}
		addIngress(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: `对外路由${record ? '修改' : '添加'}成功`
				});
				window.history.back();
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const onProtocolChange = (value: string) => {
		setProtocol(value);
	};

	const handleChange = (value: any, selectOption: any) => {
		setCurrent(value[1]);
		setNewNamespace(
			selectOption.find((item: any) => item.value === value[1]).namespace
		);
		setSelectedInstance({
			name: value[1],
			type: value[0]
		});
		getExposedService(
			value[1],
			selectOption[0].value,
			selectOption.find((item: any) => item.value === value[1]).namespace
		);
	};

	const getExposedService = (
		midName: string,
		type: string,
		defaultNamespace?: string
	) => {
		const sendData = {
			clusterId: cluster.id,
			namespace: defaultNamespace ? defaultNamespace : namespace.name,
			middlewareName: midName,
			middlewareType: type
		};
		getServices(sendData).then((res) => {
			if (res.success) {
				setServices(res.data);
				if (record?.exposeType === 'TCP' && res.data) {
					if (
						res.data.find(
							(item: any) =>
								item.serviceName ===
								record.serviceList[0].serviceName
						)
					) {
						setSelectedService(
							res.data.find(
								(item: any) =>
									item.serviceName ===
									record.serviceList[0].serviceName
							)
						);
						form.setFieldsValue({
							serviceName: res.data.find(
								(item: any) =>
									item.serviceName ===
									record.serviceList[0].serviceName
							).serviceName
						});
					} else {
						setSelectedService(res.data[0]);
						form.setFieldsValue({
							serviceName: res.data[0].serviceName
						});
					}
				} else {
					res.data && setSelectedService(res.data[0]);
					form.setFieldsValue({
						serviceName: res.data[0].serviceName
					});
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const onServiceChange = (value: string) => {
		const list = services.filter((item: any) => item.serviceName === value);
		setSelectedService(list[0]);
	};
	const onOk = () => {
		form.validateFields().then((data) => {
			const value = {
				...data,
				selectedInstance,
				selectedService
			};

			onCreate(value);
		});
	};

	return (
		<ProPage className="add-service">
			<ProHeader
				title={record ? '编辑服务暴露' : '新增服务暴露'}
				onBack={() => history.goBack()}
			/>
			<ProContent>
				<Form form={form}>
					<h2>集群选择</h2>
					<FormItem
						label="选择服务"
						labelAlign="left"
						rules={[
							{ required: true, message: '请选择服务名称！' }
						]}
						style={{ margin: '8px 0  16px 16px' }}
						name="serve"
					>
						<Cascader
							dropdownMenuColumnStyle={{ width: '170px' }}
							allowClear={false}
							style={{ width: '340px' }}
							value={current}
							options={data}
							onChange={handleChange}
							disabled={
								cluster.ingress === null ||
								!!record ||
								params.middlewareName
							}
						/>
					</FormItem>
					<h2>选择暴露方式及对象</h2>
					<FormItem
						label="暴露方式"
						labelAlign="left"
						required
						style={{ margin: '8px 0  16px 16px' }}
					>
						<FormItem
							name="exposeType"
							rules={[
								{ required: true, message: '请选择暴露方式！' }
							]}
						>
							<Select
								onChange={onChange}
								style={{ width: '120px' }}
								value={exposedWay}
								disabled={cluster.ingress === null || !!record}
							>
								<Option value="Ingress" key="Ingress">
									Ingress
								</Option>
								<Option value="NodePort" key="NodePort">
									NodePort
								</Option>
							</Select>
						</FormItem>
						{exposedWay === 'Ingress' && (
							<FormItem
								name="ingressClassName"
								rules={[
									{
										required: true,
										message: '请选择Ingress！'
									}
								]}
							>
								<Select
									placeholder="请选择一个ingress"
									style={{ width: '200px' }}
									disabled={
										record && record.protocol === 'TCP'
									}
								>
									{ingresses.map(
										(item: IngressItemProps, index) => {
											return (
												<Option
													key={index}
													value={
														item.ingressClassName
													}
												>
													{item.ingressClassName}
												</Option>
											);
										}
									)}
								</Select>
							</FormItem>
						)}
						{exposedWay === 'Ingress' && (
							<FormItem name="protocol">
								<Select
									onChange={onProtocolChange}
									style={{ width: '120px' }}
									value={protocol}
									disabled={
										cluster.ingress === null || !!record
									}
								>
									<Option value="HTTP">HTTP</Option>
									<Option value="TCP">TCP</Option>
								</Select>
							</FormItem>
						)}
						{protocol === 'TCP' && (
							<FormItem
								name="exposePort"
								rules={[
									{
										required:
											exposedWay === 'Ingress'
												? true
												: false,
										message: '对外端口不能为空！'
									},
									{
										type: 'number',
										min: 30000,
										max:
											exposedWay === 'Ingress'
												? 65535
												: 32000,
										message: `对外端口不能小于30000，大于${
											exposedWay === 'Ingress'
												? 65535
												: 32000
										}`
									}
								]}
								labelAlign="left"
							>
								<InputNumber
									placeholder={
										exposedWay === 'Ingress'
											? '端口范围：30000-65535'
											: '端口范围：30000-32000'
									}
									style={{ width: '200px' }}
									disabled={cluster.ingress === null}
								/>
							</FormItem>
						)}
					</FormItem>
					{protocol !== 'HTTP' && (
						<FormItem
							label="选择暴露对象"
							required
							labelAlign="left"
						>
							<FormItem
								name="serviceName"
								rules={[
									{
										required: true,
										message: '请选择暴露对象'
									}
								]}
							>
								<Select
									onChange={onServiceChange}
									style={{ width: '100%' }}
									value={selectedService.serviceName}
									placeholder="请选择Service"
									disabled={cluster.ingress === null}
								>
									{services &&
										services.map((item: any) => {
											return (
												<Option
													key={item.serviceName}
													value={item.serviceName}
												>
													{item.serviceName}
												</Option>
											);
										})}
								</Select>
							</FormItem>
							<FormItem
								name="servicePort"
								rules={[
									{
										required: true,
										message: '请选择暴露端口'
									}
								]}
							>
								<Select
									style={{ width: '100%' }}
									placeholder="请选择端口"
									disabled={cluster.ingress === null}
								>
									{selectedService.portDetailDtoList &&
										selectedService.portDetailDtoList.map(
											(item: any) => {
												return (
													<Option
														key={item.port}
														value={item.port}
													>
														{item.port}
													</Option>
												);
											}
										)}
								</Select>
							</FormItem>
						</FormItem>
					)}
					{protocol === 'HTTP' &&
						httpList.map((item, index) => {
							return (
								<div className="http-form" key={index}>
									<FormItem
										label="选择暴露对象"
										required
										labelAlign="left"
									>
										<FormItem
											name={'serviceName' + index}
											rules={[
												{
													required: true,
													message: '请选择暴露对象'
												}
											]}
										>
											<Select
												onChange={(value) =>
													onChangeHttp(
														value,
														item,
														'serviceName'
													)
												}
												value={item.serviceName}
												style={{ width: '200px' }}
												placeholder="请选择Service"
												disabled={
													cluster.ingress === null
												}
											>
												{services &&
													services.map(
														(item: any) => {
															return (
																<Option
																	key={
																		item.serviceName
																	}
																	value={
																		item.serviceName
																	}
																>
																	{
																		item.serviceName
																	}
																</Option>
															);
														}
													)}
											</Select>
										</FormItem>
										<FormItem
											name={'servicePort' + index}
											rules={[
												{
													required: true,
													message: '请选择暴露端口'
												}
											]}
										>
											<Select
												style={{ width: '120px' }}
												placeholder="请选择端口"
												disabled={
													cluster.ingress === null
												}
												value={item.servicePort}
												onChange={(value) =>
													onChangeHttp(
														value,
														item,
														'servicePort'
													)
												}
											>
												{selectedService.portDetailDtoList &&
													selectedService.portDetailDtoList.map(
														(item: any) => {
															return (
																<Option
																	key={
																		item.port
																	}
																	value={
																		item.port
																	}
																>
																	{item.port}
																</Option>
															);
														}
													)}
											</Select>
										</FormItem>
									</FormItem>
									<FormItem
										label="域名及路径"
										labelAlign="left"
										required
									>
										<FormItem
											name={'domain' + index}
											rules={[
												{
													required: true,
													message: '请选择暴露对象'
												},
												{
													pattern: new RegExp(
														pattern.domain,
														'i'
													),
													message:
														'请输入正确的域名格式！'
												}
											]}
										>
											<Input
												placeholder="请输入域名"
												disabled={
													cluster.ingress === null
												}
												value={item.domain}
												onChange={(e) =>
													onChangeHttp(
														e.target.value,
														item,
														'domain'
													)
												}
											/>
										</FormItem>
										<FormItem
											name={'path' + index}
											rules={[
												{
													required: true,
													message: '路径不能为空！'
												},
												{
													pattern: new RegExp(
														pattern.path,
														'i'
													),
													message:
														'请填写正确的URL映射格式，如：/path'
												}
											]}
										>
											<Input
												placeholder="请输入域名后的路径"
												disabled={
													cluster.ingress === null
												}
												value={item.path}
												onChange={(e) =>
													onChangeHttp(
														e.target.value,
														item,
														'path'
													)
												}
											/>
										</FormItem>
									</FormItem>
									<div className="http-btn">
										<Button
											style={{ marginLeft: '8px' }}
											onClick={() => copyHttpList(index)}
											disabled={httpList.length >= 10}
											icon={
												<IconFont
													type="icon-fuzhi1"
													style={{ color: '#0064C8' }}
												/>
											}
										></Button>
										<Button
											style={{ marginLeft: '8px' }}
											onClick={() => addHttpList()}
											disabled={httpList.length >= 10}
											icon={
												<PlusOutlined
													style={{ color: '#0064C8' }}
												/>
											}
										></Button>
										<Button
											style={{ marginLeft: '8px' }}
											onClick={() =>
												deleteHttpList(item.id)
											}
											disabled={httpList.length === 1}
											icon={
												<MinusOutlined
													style={{ color: '#0064C8' }}
												/>
											}
										></Button>
									</div>
								</div>
							);
						})}
				</Form>
				<div className="alarm-bottom">
					<Button
						onClick={onOk}
						type="primary"
						style={{ marginRight: '9px' }}
					>
						确认
					</Button>
					<Button
						onClick={() => {
							window.history.back();
						}}
					>
						取消
					</Button>
				</div>
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(AddServiceAvailableForm);
