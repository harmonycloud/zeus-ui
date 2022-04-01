import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import { Location } from 'history';
import SlidePanel from '@alicloud/console-components-slide-panel';
import { connect } from 'react-redux';
import {
	Form,
	Select,
	Input,
	Field,
	Message,
	CascaderSelect,
	Icon
} from '@alicloud/console-components';
import { Page, Header, Content } from '@alicloud/console-components-page';
import CustomIcon from '@/components/CustomIcon';
import messageConfig from '@/components/messageConfig';
import { getServices } from '@/services/ingress';
import pattern from '@/utils/pattern';
import { clusterType } from '@/types';
import { StoreState, globalVarProps } from '@/types/index';
import { getList } from '@/services/serviceList';
import { serviceListItemProps } from '@/pages/ServiceList/service.list';
import { filtersProps } from '@/types/comment';
import { getIngresses } from '@/services/common';
import { addIngress } from '@/services/ingress';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';

import './index.scss';
import { Button } from '@alifd/next';
import { deleteAlarm } from '@/services/middleware';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
	labelCol: {
		span: 4
	},
	wrapperCol: {
		span: 20
	}
};
interface stateProps {
	middlewareName: string;
}
function AddServiceAvailableForm(props: any): JSX.Element {
	const { visible, onCancel } = props;
	const { cluster, namespace, project } = props.globalVar;

	const [isProcessing, setIsProcessing] = useState(false); // 确认按钮 loading
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
	const middlewareName = location?.state?.middlewareName || '';
	const [ingressTcpFlag] = useState(cluster.ingressList || false);
	const [data, setData] = useState([]);
	const [current, setCurrent] = useState<string>();
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
	const field = Field.useField();
	const history = useHistory();

	useEffect(() => {
		if (JSON.stringify(namespace) !== '{}' && cluster.ingress !== null) {
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
									isLeaf: true
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
					getExposedService(
						selectedInstanceTemp.name,
						selectedInstanceTemp.type
					);
				}
			});
			getIngresses({ clusterId: cluster.id }).then((res) => {
				if (res.success) {
					setIngresses(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	}, [namespace, cluster]);
	const onChange = (value: string) => {
		setExposedWay(value);
		value === 'NodePort' ? setProtocol('TCP') : setProtocol('HTTP');
	};

	const addHttpList = () => {
		setHttpList([...httpList, { id: Math.random() }]);
	};
	const copyHttpList = (index: number) => {
		const addItem = httpList[index];
		setHttpList([
			...httpList,
			{
				...addItem,
				id: Math.random() * 100,
				servicePort: '',
				path: ''
			}
		]);
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
		const sendData =
			values.protocol === 'HTTP'
				? {
						clusterId: cluster.id,
						namespace: namespace.name,
						exposeType: values.exposeType,
						middlewareName: values.selectedInstance.name,
						middlewareType: values.selectedInstance.type,
						ingressClassName: values.ingressClassName,
						protocol: values.protocol,
						rules: [
							{
								domain: httpList[0].domain,
								ingressHttpPaths: [
									{
										path: httpList[0].path,
										serviceName: httpList[0].serviceName,
										servicePort: httpList[0].servicePort
									}
								]
							}
						]
				  }
				: {
						clusterId: cluster.id,
						namespace: namespace.name,
						exposeType: values.exposeType,
						middlewareName: values.selectedInstance.name,
						middlewareType: values.selectedInstance.type,
						ingressClassName: values.ingressClassName,
						protocol: values.protocol,
						serviceList: [
							{
								exposePort: values.exposePort,
								serviceName: values.serviceName,
								servicePort: values.servicePort,
								targetPort:
									values.selectedService.portDetailDtoList[0]
										.targetPort
							}
						]
				  };
		addIngress(sendData).then((res) => {
			if (res.success) {
				Message.show(
					messageConfig('success', '成功', '对外路由添加成功')
				);
				window.history.back();
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const onProtocolChange = (value: string) => {
		setProtocol(value);
	};

	const handleChange = (value: string | string[], data: any, extra: any) => {
		setCurrent(value as string);
		setSelectedInstance({
			name: value as string,
			type: extra.selectedPath[0].value
		});
		getExposedService(value as string, extra.selectedPath[0].value);
	};

	const getExposedService = (midName: string, type: string) => {
		const sendData = {
			clusterId: cluster.id,
			namespace: namespace.name,
			middlewareName: midName,
			middlewareType: type
		};
		getServices(sendData).then((res) => {
			if (res.success) {
				setServices(res.data);
				setSelectedService(res.data[0]);
				// setServicePorts(res.data[0].portDetailDtoList);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const onServiceChange = (value: string) => {
		const list = services.filter((item: any) => item.serviceName === value);
		setSelectedService(list[0]);
	};
	const onOk = () => {
		field.validate((err, data) => {
			if (!err) {
				setIsProcessing(true);
				setIsProcessing(false);
				const value = {
					...data,
					selectedInstance,
					selectedService
				};
				onCreate(value);
			}
		});
	};

	return (
		// <SlidePanel
		// 	top={48}
		// 	title="暴露服务"
		// 	okText="提交"
		// 	isShowing={visible}
		// 	width="medium"
		// 	onMaskClick={() => {
		// 		// * 点击蒙版关闭抽屉
		// 		onCancel();
		// 	}}
		// 	onClose={() => {
		// 		onCancel();
		// 	}}
		// 	onCancel={() => {
		// 		onCancel();
		// 	}}
		// 	onOk={onOk}
		// 	isProcessing={isProcessing}
		// >
		<Page className="add-service">
			<Header
				title={'新增服务暴露'}
				hasBackArrow
				onBackArrowClick={() => history.goBack()}
			/>
			<Content>
				<Form field={field}>
					<h2>资源池选择</h2>
					<FormItem
						label="选择服务"
						required
						labelTextAlign="left"
						requiredMessage="请选择服务名称！"
						asterisk={false}
						className="ne-required-ingress"
						style={{ margin: '8px 0  16px 16px' }}
					>
						<CascaderSelect
							listStyle={{ width: '170px' }}
							style={{ width: '340px' }}
							value={current}
							dataSource={data}
							onChange={handleChange}
							disabled={cluster.ingress === null}
						/>
					</FormItem>
					<h2>选择暴露方式及对象</h2>
					<FormItem
						label="暴露方式"
						labelTextAlign="left"
						asterisk={false}
						className="ne-required-ingress"
						style={{ margin: '8px 0  16px 16px' }}
					>
						<FormItem>
							<Select
								name="exposeType"
								onChange={onChange}
								style={{ width: '120px' }}
								value={exposedWay}
								disabled={cluster.ingress === null}
							>
								<Option value="Ingress">Ingress</Option>
								<Option value="NodePort">NodePort</Option>
							</Select>
						</FormItem>
						{exposedWay === 'Ingress' && (
							<FormItem
								required
								requiredMessage="请选择Ingress！"
							>
								<Select
									name="ingressClassName"
									placeholder="请选择一个ingress"
									style={{ width: '200px' }}
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
							<FormItem>
								<Select
									name="protocol"
									onChange={onProtocolChange}
									style={{ width: '120px' }}
									value={protocol}
									disabled={cluster.ingress === null}
								>
									<Option value="HTTP">HTTP</Option>
									<Option value="TCP">TCP</Option>
								</Select>
							</FormItem>
						)}
						{protocol === 'TCP' && (
							<FormItem
								required={
									exposedWay === 'Ingress' ? true : false
								}
								labelTextAlign="left"
								requiredMessage="对外端口不能为空！"
								format="number"
								formatMessage="请填写数字！"
								min={30000}
								max={exposedWay === 'Ingress' ? 65535 : 32000}
								minmaxMessage={`对外端口不能小于30000，大于${
									exposedWay === 'Ingress' ? 65535 : 32000
								}`}
							>
								<Input
									name="exposePort"
									htmlType="number"
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
							labelTextAlign="left"
							asterisk={false}
							className="ne-required-ingress"
						>
							<FormItem required requiredMessage="请选择暴露对象">
								<Select
									name="serviceName"
									onChange={onServiceChange}
									style={{ width: '100%' }}
									// value={selectedService.serviceName}
									autoWidth={false}
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
								required
								requiredMessage="请选择暴露端口！"
							>
								<Select
									name="servicePort"
									style={{ width: '100%' }}
									autoWidth={false}
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
										labelTextAlign="left"
										asterisk={false}
										className="ne-required-ingress"
									>
										<FormItem
											required
											requiredMessage="请选择暴露对象"
										>
											<Select
												name={'serviceName' + index}
												onChange={(value) =>
													onChangeHttp(
														value,
														item,
														'serviceName'
													)
												}
												value={item.serviceName}
												style={{ width: '200px' }}
												// value={
												// 	selectedService.serviceName
												// }
												// autoWidth={false}
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
											required
											requiredMessage="请选择暴露端口！"
										>
											<Select
												name={'servicePort' + index}
												style={{ width: '120px' }}
												// autoWidth={false}
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
										className="ne-required-ingress"
										labelTextAlign="left"
									>
										<FormItem
											required
											requiredMessage="域名不能为空！"
											pattern={pattern.domain}
											patternMessage="请输入正确的域名格式！"
										>
											<Input
												name={'domain' + index}
												placeholder="请输入域名"
												disabled={
													cluster.ingress === null
												}
												value={item.domain}
												onChange={(value) =>
													onChangeHttp(
														value,
														item,
														'domain'
													)
												}
											/>
										</FormItem>
										<FormItem
											required
											requiredMessage="路径不能为空！"
											pattern={pattern.path}
											patternMessage="请填写正确的URL映射格式，如：/path"
										>
											<Input
												name={'path' + index}
												placeholder="请输入域名后的路径"
												disabled={
													cluster.ingress === null
												}
												value={item.path}
												onChange={(value) =>
													onChangeHttp(
														value,
														item,
														'path'
													)
												}
											/>
										</FormItem>
										{console.log(httpList)}
									</FormItem>
									<div className="http-btn">
										<Button
											style={{ marginLeft: '8px' }}
											onClick={() => copyHttpList(index)}
											disabled={httpList.length >= 10}
										>
											<CustomIcon
												type="icon-fuzhi1"
												size={12}
												style={{ color: '#0064C8' }}
											/>
										</Button>
										<Button
											style={{ marginLeft: '8px' }}
											onClick={() => addHttpList()}
											disabled={httpList.length >= 10}
										>
											<Icon
												type="plus"
												style={{ color: '#0064C8' }}
											/>
										</Button>
										<Button
											style={{ marginLeft: '8px' }}
											onClick={() =>
												deleteHttpList(item.id)
											}
											disabled={httpList.length === 1}
										>
											<Icon
												type="wind-minus"
												style={{ color: '#0064C8' }}
											/>
										</Button>
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
			</Content>
			{/* </SlidePanel> */}
		</Page>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(AddServiceAvailableForm);
