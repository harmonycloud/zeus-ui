import React, { useEffect, useState } from 'react';
import {
	Button,
	Col,
	Divider,
	Form,
	Input,
	InputNumber,
	notification,
	Row,
	Select,
	Space,
	Tag
} from 'antd';
import { IconFont } from '@/components/IconFont';
import { useParams, useHistory } from 'react-router';
import { getIngresses } from '@/services/common';
import { ProHeader, ProPage, ProContent } from '@/components/ProPage';
import {
	HttpPathItem,
	ServiceIngressAddParams,
	ServiceNameItem
} from '../detail';
import { formItemLayout410 } from '@/utils/const';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
import './index.scss';
import {
	CloseCircleOutlined,
	DribbbleOutlined,
	PlusCircleOutlined
} from '@ant-design/icons';
import { addIngress } from '@/services/ingress';
import { serviceAvailableItemProps } from '@/pages/ServiceAvailable/service.available';
import storage from '@/utils/storage';

const Option = Select.Option;
const FormItem = Form.Item;
export default function AddEsIngress(): JSX.Element {
	const history = useHistory();
	const params: ServiceIngressAddParams = useParams();
	const {
		name,
		aliasName,
		namespace,
		middlewareName,
		clusterId,
		mode,
		chartVersion
	} = params;
	const [networkModel, setNetworkModel] = useState<number>(4);
	const [curServiceName, setCurServiceName] = useState<ServiceNameItem>();
	const [serviceNames, setServiceNames] = useState<ServiceNameItem[]>([]);
	const [exposeType, setExposeType] = useState<string>('TCP');
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	const [httpPaths, setHttpPaths] = useState<HttpPathItem[]>([
		{ path: '', serviceName: '', servicePort: '', id: Math.random() }
	]);
	const [serviceIngress] = useState<serviceAvailableItemProps>(
		storage.getSession('serviceIngress')
	);
	const [ingressClassName, setIngressClassName] = useState<{
		value: string;
		type: string;
		startPort: number;
		endPort: number;
	}>();
	const [form] = Form.useForm();
	useEffect(() => {
		getIngresses({ clusterId: clusterId }).then((res) => {
			if (res.success) {
				setIngresses(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	useEffect(() => {
		if (serviceIngress) {
			setExposeType(
				serviceIngress.exposeType === 'Ingress'
					? 'TCP'
					: serviceIngress.exposeType
			);
			form.setFieldsValue({
				networkModel: serviceIngress.networkModel,
				exposeType:
					serviceIngress.exposeType === 'Ingress'
						? 'TCP'
						: serviceIngress.exposeType,
				ingressClassName: serviceIngress.ingressClassName,
				exposePort: Number(
					serviceIngress?.serviceList?.[0]?.exposePort
				),
				domain: serviceIngress.rules?.[0].domain
			});
			if (serviceIngress.protocol === 'HTTP') {
				setHttpPaths(
					serviceIngress.rules[0].ingressHttpPaths.map(
						(item: any) => {
							item.id = Math.random();
							return item;
						}
					)
				);
			}
			setNetworkModel(serviceIngress.networkModel);
			setCurServiceName({
				name: serviceIngress.serviceList?.[0].serviceName,
				label: serviceIngress.servicePurpose || '读写',
				icon:
					serviceIngress.servicePurpose === '管理页面'
						? 'icon-yemianguanli'
						: 'icon-duxie1',
				port: Number(serviceIngress.serviceList?.[0].servicePort)
			});
		}
		return () =>
			storage.getSession('serviceIngress') &&
			storage.removeSession('serviceIngress');
	}, []);
	useEffect(() => {
		let list = [];
		switch (mode) {
			case 'simple':
				list = [
					{
						name: `${middlewareName}-master`,
						label: '读写',
						icon: 'icon-duxie1',
						port: 9200
					},
					{
						name: `${middlewareName}-kibana`,
						label: '管理页面',
						icon: 'icon-yemianguanli',
						port: 5200
					}
				];
				setServiceNames(list);
				!storage.getSession('serviceIngress') &&
					setCurServiceName(list[0]);
				break;
			case 'complex':
				list = [
					{
						name: `${middlewareName}-client`,
						label: '读写',
						icon: 'icon-duxie1',
						port: 9200
					},
					{
						name: `${middlewareName}-kibana`,
						label: '管理页面',
						icon: 'icon-yemianguanli',
						port: 5200
					}
				];
				setServiceNames(list);
				!storage.getSession('serviceIngress') &&
					setCurServiceName(list[0]);
				break;
			case 'cold-complex':
				list = [
					{
						name: `${middlewareName}-client`,
						label: '读写',
						icon: 'icon-duxie1',
						port: 9200
					},
					{
						name: `${middlewareName}-kibana`,
						label: '管理页面',
						icon: 'icon-yemianguanli',
						port: 5200
					}
				];
				setServiceNames(list);
				!storage.getSession('serviceIngress') &&
					setCurServiceName(list[0]);
				break;
			default:
				list = [
					{
						name: `${middlewareName}-data`,
						label: '读写',
						icon: 'icon-duxie1',
						port: 9200
					},
					{
						name: `${middlewareName}-kibana`,
						label: '管理页面',
						icon: 'icon-yemianguanli',
						port: 5200
					}
				];
				setServiceNames(list);
				!storage.getSession('serviceIngress') &&
					setCurServiceName(list[0]);
				break;
		}
	}, []);
	const handleClick = (record: ServiceNameItem) => {
		setCurServiceName(record);
	};
	const addHttpPath = () => {
		setHttpPaths([
			...httpPaths,
			{
				path: '',
				serviceName: '',
				servicePort: '',
				id: Math.random()
			}
		]);
	};
	const deleteHttpPath = (record: HttpPathItem) => {
		setHttpPaths(
			httpPaths.filter((item: HttpPathItem) => item.id !== record.id)
		);
	};
	const handleChange = (
		value: string,
		record: HttpPathItem,
		type: string
	) => {
		const lt = httpPaths.map((item) => {
			if (item.id === record.id) {
				switch (type) {
					case 'serviceName':
						item.serviceName = value;
						if (value === `${middlewareName}-kibana`) {
							item.servicePort = 5200;
						} else {
							item.servicePort = 9200;
						}
						break;
					case 'path':
						item.path = value;
						break;
					default:
						break;
				}
			}
			return item;
		});
		setHttpPaths(lt);
	};
	const handleSubmit = () => {
		form.validateFields().then((values) => {
			let sendData = {};
			let edit = {};
			let old = {};
			if (serviceIngress)
				edit = {
					name: serviceIngress.name
						? serviceIngress.name
						: serviceIngress.middlewareName
				};
			if (
				serviceIngress.exposeType === 'Ingress' &&
				serviceIngress.protocol === 'TCP'
			)
				old = {
					oldServicePort: serviceIngress.serviceList[0].servicePort,
					oldExposePort: serviceIngress.serviceList[0].exposePort,
					oldServiceName: serviceIngress.serviceList[0].serviceName
				};
			if (networkModel === 7) {
				if (
					httpPaths.some(
						(item: HttpPathItem) =>
							item.path === '' || item.serviceName === ''
					)
				) {
					notification.error({
						message: '失败',
						description: '请添加服务暴露和路径'
					});
					return;
				}
				sendData = {
					...edit,
					clusterId,
					namespace,
					middlewareName,
					networkModel: 7,
					exposeType: 'Ingress',
					middlewareType: name,
					ingressClassName: values.ingressClassName,
					protocol: 'HTTP',
					rules: [
						{
							domain: values.domain,
							ingressHttpPaths: httpPaths
						}
					]
				};
			} else {
				sendData = {
					...edit,
					clusterId,
					namespace,
					middlewareName,
					networkModel: 4,
					exposeType:
						values.exposeType === 'TCP' ? 'Ingress' : 'NodePort',
					middlewareType: name,
					ingressClassName: values.ingressClassName,
					protocol: values.exposeType === 'TCP' ? 'TCP' : null,
					serviceList: [
						{
							serviceName: curServiceName?.name,
							exposePort: values.exposePort,
							servicePort: curServiceName?.port,
							targetPort: curServiceName?.port,
							...old
						}
					]
				};
			}
			addIngress(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: `服务暴露${
							serviceIngress ? '编辑' : '新建'
						}成功`
					});
					history.push(
						`/serviceList/${name}/${aliasName}/externalAccess/${middlewareName}/${name}/${chartVersion}/${namespace}`
					);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};
	const handleIngressChange = (value: string) => {
		const cur = ingresses.find((item) => item.ingressClassName === value);
		setIngressClassName({
			value: value,
			type: cur?.type as string,
			startPort: Number(cur?.startPort || 0),
			endPort: Number(cur?.endPort || 0)
		});
	};
	return (
		<ProPage>
			<ProHeader
				title={`服务暴露${serviceIngress ? '编辑' : '新增'}`}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Form {...formItemLayout410} form={form} labelAlign="left">
					<h2>暴露方式</h2>
					<FormItem
						label="暴露方式"
						required
						name="networkModel"
						initialValue={4}
					>
						<Select
							disabled={!!serviceIngress}
							value={networkModel}
							onChange={(value: number) => setNetworkModel(value)}
						>
							<Option value={4}>四层网络暴露</Option>
							<Option value={7}>七层网络暴露</Option>
						</Select>
					</FormItem>
					{networkModel === 4 && (
						<>
							<h2>暴露服务</h2>
							<FormItem
								label="暴露服务"
								name="serviceName"
								required
							>
								<Space>
									{serviceNames.map(
										(
											item: ServiceNameItem,
											index: number
										) => {
											return (
												<div
													key={index}
													className={`ingress-service-box ${
														curServiceName?.name.includes(
															item.name
														)
															? 'ingress-service-box-active'
															: ''
													}`}
													style={{
														background:
															!serviceIngress
																? '#ffffff'
																: '#f3f3f3'
													}}
													onClick={() =>
														!serviceIngress &&
														handleClick(item)
													}
												>
													<IconFont
														type={item.icon}
														style={{
															fontSize: '40px',
															color: '#8D9299'
														}}
													/>
													<div className="ingress-service-box-label">
														{item.label}
													</div>
												</div>
											);
										}
									)}
								</Space>
							</FormItem>
							<h2>暴露配置</h2>
							<FormItem
								required
								label="暴露方式"
								name="exposeType"
								initialValue={exposeType}
							>
								<Select
									disabled={!!serviceIngress}
									value={exposeType}
									onChange={(value) => setExposeType(value)}
								>
									<Option value="NodePort">NodePort</Option>
									<Option value="TCP">Ingress-TCP</Option>
								</Select>
							</FormItem>
							{exposeType === 'TCP' && (
								<FormItem
									name="ingressClassName"
									required
									label="负载均衡选择"
									rules={[
										{
											required: true,
											message: '请选择负载均衡'
										}
									]}
								>
									<Select
										value={ingressClassName?.value}
										disabled={!!serviceIngress}
										placeholder="请选择负载均衡"
										onChange={handleIngressChange}
									>
										{ingresses.map(
											(item: IngressItemProps) => {
												return (
													<Option
														key={
															item.ingressClassName
														}
														value={
															item.ingressClassName
														}
													>
														<div className="flex-space-between">
															{
																item.ingressClassName
															}
															<Tag
																color={
																	item.type ===
																	'nginx'
																		? 'cyan'
																		: 'green'
																}
															>
																{item.type}
															</Tag>
														</div>
													</Option>
												);
											}
										)}
									</Select>
								</FormItem>
							)}
							<FormItem
								name="exposePort"
								label="对外端口配置"
								required
								rules={[
									{
										required: true,
										message: '请填写proxy端口'
									},
									{
										max:
											exposeType === 'TCP'
												? ingressClassName?.type ===
												  'traefik'
													? ingressClassName.endPort
													: 65535
												: 32767,
										min:
											ingressClassName?.type === 'traefik'
												? ingressClassName.startPort
												: 30000,
										type: 'number',
										message: `请输入${
											ingressClassName?.type === 'traefik'
												? ingressClassName.startPort
												: 30000
										}-${
											exposeType === 'TCP'
												? ingressClassName?.type ===
												  'traefik'
													? ingressClassName.endPort
													: 65535
												: 32767
										}以内的端口`
									}
								]}
							>
								<InputNumber
									placeholder={`请输入${
										ingressClassName?.type === 'traefik'
											? ingressClassName.startPort
											: 30000
									}-${
										exposeType === 'TCP'
											? ingressClassName?.type ===
											  'traefik'
												? ingressClassName.endPort
												: 65535
											: 32767
									}以内的端口`}
									style={{ width: 250 }}
								/>
							</FormItem>
							{ingressClassName?.type === 'traefik' && (
								<Row>
									<Col span={4}></Col>
									<Col span={10}>
										<div>
											当前负载均衡相关端口组为
											{ingressClassName?.startPort}-
											{ingressClassName?.endPort}
											,请在端口组范围内选择端口
										</div>
									</Col>
								</Row>
							)}
						</>
					)}
					{networkModel === 7 && (
						<>
							<h2>暴露服务</h2>
							<FormItem
								name="ingressClassName"
								required
								label="负载均衡选择"
								rules={[
									{
										required: true,
										message: '请选择负载均衡'
									}
								]}
							>
								<Select
									disabled={!!serviceIngress}
									placeholder="请选择负载均衡"
								>
									{ingresses.map((item: IngressItemProps) => {
										return (
											<Option
												key={item.ingressClassName}
												value={item.ingressClassName}
											>
												<div className="flex-space-between">
													{item.ingressClassName}
													<Tag
														color={
															item.type ===
															'nginx'
																? 'cyan'
																: 'green'
														}
													>
														{item.type}
													</Tag>
												</div>
											</Option>
										);
									})}
								</Select>
							</FormItem>
							<FormItem
								name="domain"
								label="域名"
								required
								rules={[
									{ required: true, message: '请填写域名' }
								]}
							>
								<Input
									disabled={!!serviceIngress}
									placeholder="请输入域名"
								/>
							</FormItem>
							{httpPaths.map(
								(item: HttpPathItem, index: number) => {
									return (
										<Row key={item.id}>
											<Col span={4}></Col>
											<Col span={10}>
												<div className="add-list-item-box">
													<DribbbleOutlined
														style={{
															fontSize: 24,
															color: '#8a8a8a'
														}}
													/>
													<FormItem
														labelCol={{ span: 8 }}
														wrapperCol={{
															span: 12
														}}
														style={{
															marginBottom: 0
														}}
														labelAlign="right"
														label="暴露服务"
														required
														name={`service${index}`}
														initialValue={
															item.serviceName
														}
													>
														<Select
															style={{
																width: '140px'
															}}
															value={
																item.serviceName
															}
															onChange={(value) =>
																handleChange(
																	value,
																	item,
																	'serviceName'
																)
															}
														>
															{serviceNames.map(
																(
																	st: ServiceNameItem
																) => {
																	return (
																		<Select.Option
																			key={
																				st.name
																			}
																			value={
																				st.name
																			}
																			disabled={httpPaths.some(
																				(
																					hp
																				) =>
																					hp.serviceName ===
																					st.name
																			)}
																		>
																			{
																				st.label
																			}
																		</Select.Option>
																	);
																}
															)}
														</Select>
													</FormItem>
													<FormItem
														labelCol={{ span: 6 }}
														wrapperCol={{
															span: 12
														}}
														style={{
															marginBottom: 0
														}}
														labelAlign="right"
														label="路径"
														name={`path${index}`}
														required
														initialValue={item.path}
													>
														<Input
															value={item.path}
															style={{
																width: '140px'
															}}
															onChange={(
																e: React.ChangeEvent<HTMLInputElement>
															) =>
																handleChange(
																	e.target
																		.value,
																	item,
																	'path'
																)
															}
														/>
													</FormItem>
													<CloseCircleOutlined
														className="add-list-item-closed"
														style={{
															visibility:
																index !== 0
																	? 'initial'
																	: 'hidden'
														}}
														onClick={() =>
															deleteHttpPath(item)
														}
													/>
												</div>
											</Col>
										</Row>
									);
								}
							)}
							{httpPaths.length < 2 && (
								<Row>
									<Col span={4}></Col>
									<Col span={10}>
										<div
											className="es-ingress-seven-add"
											onClick={addHttpPath}
										>
											<Space>
												<PlusCircleOutlined />
												新增
											</Space>
										</div>
									</Col>
								</Row>
							)}
						</>
					)}
					<Divider />
					<Space>
						<Button type="primary" onClick={handleSubmit}>
							确定
						</Button>
						<Button onClick={() => window.history.back()}>
							取消
						</Button>
					</Space>
				</Form>
			</ProContent>
		</ProPage>
	);
}
