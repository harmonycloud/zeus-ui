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
	Space
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
		let list = [];
		switch (mode) {
			case 'simple':
				list = [
					{
						name: `${middlewareName}-master`,
						label: '读写',
						icon: 'icon-duxie1'
					},
					{
						name: `${middlewareName}-kibana`,
						label: '管理页面',
						icon: 'icon-yemianguanli'
					}
				];
				setServiceNames(list);
				setCurServiceName(list[0]);
				break;
			case 'complex':
				list = [
					{
						name: `${middlewareName}-client`,
						label: '读写',
						icon: 'icon-duxie1'
					},
					{
						name: `${middlewareName}-kibana`,
						label: '管理页面',
						icon: 'icon-yemianguanli'
					}
				];
				setServiceNames(list);
				setCurServiceName(list[0]);
				break;
			case 'cold-complex':
				list = [
					{
						name: `${middlewareName}-client`,
						label: '读写',
						icon: 'icon-duxie1'
					},
					{
						name: `${middlewareName}-kibana`,
						label: '管理页面',
						icon: 'icon-yemianguanli'
					}
				];
				setServiceNames(list);
				setCurServiceName(list[0]);
				break;
			default:
				list = [
					{
						name: `${middlewareName}-data`,
						label: '读写',
						icon: 'icon-duxie1'
					},
					{
						name: `${middlewareName}-kibana`,
						label: '管理页面',
						icon: 'icon-yemianguanli'
					}
				];
				setServiceNames(list);
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
			if (networkModel === 7) {
				sendData = {
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
							servicePort: 9200,
							targetPort: 9200
						}
					]
				};
			}
			addIngress(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '服务暴露新建成功'
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
	return (
		<ProPage>
			<ProHeader
				title="服务暴露新增"
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
														item.name ===
														curServiceName?.name
															? 'ingress-service-box-active'
															: ''
													}`}
													onClick={() =>
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
									value={exposeType}
									onChange={(value) => setExposeType(value)}
								>
									<Option value="NodePort">NodePort</Option>
									<Option value="TCP">TCP</Option>
								</Select>
							</FormItem>
							{exposeType === 'TCP' && (
								<FormItem
									name="ingressClassName"
									required
									label="负载均衡选择"
								>
									<Select>
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
														{item.ingressClassName}
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
												? 65535
												: 32767,
										min: 30000,
										type: 'number',
										message: `请输入30000-${
											exposeType === 'TCP' ? 65535 : 32767
										}以内的端口`
									}
								]}
							>
								<InputNumber style={{ width: '160px' }} />
							</FormItem>
						</>
					)}
					{networkModel === 7 && (
						<>
							<h2>暴露服务</h2>
							<FormItem
								name="ingressClassName"
								required
								label="负载均衡选择"
							>
								<Select>
									{ingresses.map((item: IngressItemProps) => {
										return (
											<Option
												key={item.ingressClassName}
												value={item.ingressClassName}
											>
												{item.ingressClassName}
											</Option>
										);
									})}
								</Select>
							</FormItem>
							<FormItem name="domain" label="域名" required>
								<Input placeholder="请输入域名" />
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
																	item: ServiceNameItem
																) => {
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
																				item.label
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
