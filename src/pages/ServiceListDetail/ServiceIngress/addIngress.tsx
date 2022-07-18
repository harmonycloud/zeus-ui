import React, { useEffect, useState } from 'react';
import { ProHeader, ProPage, ProContent } from '@/components/ProPage';
import {
	Form,
	Input,
	Select,
	InputNumber,
	notification,
	Space,
	Switch,
	Button,
	Divider
} from 'antd';
import { useParams } from 'react-router';
import { ServiceIngressAddParams, ServiceNameItem } from '../detail';
import { getIngresses } from '@/services/common';
import { formItemLayout410 } from '@/utils/const';
import { IconFont } from '@/components/IconFont';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
import './index.scss';
import SelectBlock from '@/components/SelectBlock';
import { addIngress } from '@/services/ingress';

const FormItem = Form.Item;
const Option = Select.Option;
const fourNetworkIngress = [
	{ value: 'TCP', label: 'TCP' },
	{ value: 'NodePort', label: 'NodePort' }
];
// kfk mq 的添加服务暴露页面
export default function ServiceDetailAddIngress(): JSX.Element {
	const params: ServiceIngressAddParams = useParams();
	const { name, namespace, middlewareName, clusterId, brokerNum } = params;
	const [form] = Form.useForm();
	const [curServiceName, setCurServiceName] = useState<ServiceNameItem>();
	const [serviceNames, setServiceNames] = useState<ServiceNameItem[]>([]);
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	const [autoConfig, setAutoConfig] = useState<boolean>(true);
	const [exposeType, setExposeType] = useState<string>('TCP');
	const [brokers, setBrokers] = useState<number[]>([]);
	const [networkIngress, setNetworkIngress] = useState<number>(4);
	useEffect(() => {
		if (name === 'kafka') {
			const list = [
				{
					name: 'cluster',
					label: '集群外访问',
					icon: 'icon-jiqunwaifangwen'
				},
				{
					name: `${middlewareName}-manager-svc`,
					label: '管理页面',
					icon: 'icon-yemianguanli'
				}
			];
			const at = [];
			for (let i = 0; i < Number(brokerNum); i++) {
				at.push(i);
			}
			setBrokers(at);
			setServiceNames(list);
			setCurServiceName(list[0]);
		} else if (name === 'rocketmq') {
			const list = [
				{
					name: 'cluster',
					label: '集群外访问',
					icon: 'icon-jiqunwaifangwen',
					port: null
				},
				{
					name: `${middlewareName}-console-svc`,
					label: '管理页面',
					icon: 'icon-yemianguanli',
					port: 8080
				}
			];
			setServiceNames(list);
			setCurServiceName(list[0]);
		}
	}, [name]);
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
	const handleClick = (record: ServiceNameItem) => {
		setCurServiceName(record);
	};
	const handleSubmit = () => {
		form.validateFields().then((values) => {
			console.log(values);
			const lt = [];
			let sendData = {};
			// * 集群外访问
			if (curServiceName?.name === 'cluster') {
				if (autoConfig) {
					for (let i = 0; i < Number(brokerNum); i++) {
						lt.push({
							serviceName: `${middlewareName}-kafka-external-svc-${i}`,
							exposePort: null
						});
					}
				} else {
					for (let i = 0; i < Number(brokerNum); i++) {
						lt.push({
							serviceName: `${middlewareName}-kafka-external-svc-${i}`,
							exposePort: values[`brokerPort${i}`]
						});
					}
				}
				sendData = {
					clusterId,
					namespace,
					middlewareName,
					exposeType:
						values.exposeType === 'TCP'
							? 'Ingress'
							: values.exposeType,
					middlewareType: name,
					ingressClassName: values.ingressClassName,
					protocol: values.exposeType === 'TCP' ? 'TCP' : null,
					serviceList: lt
				};
				console.log(sendData);
			} else {
				// * 管理页面
				if (values.networkModel === 4) {
					// 4层网络暴露
					sendData = {
						clusterId,
						namespace,
						middlewareName,
						networkModel: values.networkModel,
						exposeType:
							exposeType === 'TCP' ? 'Ingress' : exposeType,
						middlewareType: name,
						ingressClassName: values.ingressClassName,
						protocol: exposeType === 'TCP' ? 'TCP' : null,
						serviceList: [
							{
								serviceName: `${middlewareName}-manager-svc`,
								exposePort: values.exposePort,
								servicePort: 9000,
								targetPort: 9000
							}
						]
					};
					console.log(sendData);
				} else {
					// 7层网络暴露
					sendData = {
						clusterId,
						namespace,
						middlewareName,
						networkModel: values.networkModel,
						exposeType: 'Ingress',
						protocol: 'HTTP',
						ingressClassName: values.ingressClassName,
						middlewareType: name,
						rules: [
							{
								domain: values.domain,
								ingressHttpPaths: [
									{
										path: values.path,
										serviceName: `${middlewareName}-manager-svc`,
										servicePort: 9000
									}
								]
							}
						]
					};
					console.log(sendData);
				}
			}
			addIngress(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '服务暴露新建成功'
					});
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
					<h2>暴露服务</h2>
					<FormItem required name="serviceName" label="暴露服务">
						<Space>
							{serviceNames.map(
								(item: ServiceNameItem, index: number) => {
									return (
										<div
											key={index}
											className={`ingress-service-box ${
												item.name ===
												curServiceName?.name
													? 'ingress-service-box-active'
													: ''
											}`}
											onClick={() => handleClick(item)}
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
					{/* 选择集群外访问 */}
					{curServiceName?.name === 'cluster' && (
						<>
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
								label={`${
									name === 'kafka' ? 'proxy' : 'NameServer'
								}端口配置`}
								required
								name="exposePort"
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
								<InputNumber style={{ width: '260px' }} />
							</FormItem>
							<FormItem
								name="brokerPort"
								label="自动配置broker对外端口"
								required
							>
								<Switch
									checked={autoConfig}
									onChange={(checked: boolean) =>
										setAutoConfig(checked)
									}
								/>
							</FormItem>
							{!autoConfig && (
								<div className="ingress-broker-content">
									{brokers.map((item: number) => {
										return (
											<FormItem
												key={item}
												label={`broker对外端口${item}配置`}
												name={`brokerPort${item}`}
												required
												rules={[
													{
														min: 30000,
														max: 65535,
														type: 'number',
														message:
															'请输入符合规定的端口号'
													}
												]}
											>
												<InputNumber
													placeholder="请输入30000-65535以内的端口"
													style={{ width: '260px' }}
												/>
											</FormItem>
										);
									})}
								</div>
							)}
						</>
					)}
					{/* 选择管理页面 */}
					{(curServiceName?.name ===
						`${middlewareName}-console-svc` ||
						curServiceName?.name ===
							`${middlewareName}-manager-svc`) && (
						<>
							<h2>暴露配置</h2>
							<FormItem
								label="暴露方式"
								name="networkModel"
								required
								initialValue={4}
							>
								<Select
									value={networkIngress}
									onChange={(value: number) =>
										setNetworkIngress(value)
									}
								>
									<Option value={4}>四层网络暴露</Option>
									<Option value={7}>七层网络暴露</Option>
								</Select>
							</FormItem>
							{networkIngress === 4 && (
								<>
									<div className="ingress-four-tcp-or-NodePort">
										<SelectBlock
											options={fourNetworkIngress}
											currentValue={exposeType}
											onCallBack={(value: any) =>
												setExposeType(value)
											}
										/>
									</div>
									{exposeType === 'TCP' && (
										<FormItem
											name="ingressClassName"
											required
											label="负载均衡选择"
										>
											<Select>
												{ingresses.map(
													(
														item: IngressItemProps
													) => {
														return (
															<Option
																key={
																	item.ingressClassName
																}
																value={
																	item.ingressClassName
																}
															>
																{
																	item.ingressClassName
																}
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
													exposeType === 'TCP'
														? 65535
														: 32767
												}以内的端口`
											}
										]}
									>
										<InputNumber
											style={{ width: '160px' }}
										/>
									</FormItem>
								</>
							)}
							{networkIngress === 7 && (
								<>
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
															{
																item.ingressClassName
															}
														</Option>
													);
												}
											)}
										</Select>
									</FormItem>
									<FormItem
										label="域名路径"
										required
										name="domainPath"
									>
										<div className="display-flex flex-align">
											<FormItem noStyle name="domain">
												<Input
													style={{ width: '65%' }}
													placeholder="请输入域名"
												/>
											</FormItem>
											<FormItem noStyle name="path">
												<Input
													style={{
														width: 'calc(35% + 2px)',
														marginLeft: '-2px'
													}}
													placeholder="请输入路径"
												/>
											</FormItem>
										</div>
									</FormItem>
								</>
							)}
						</>
					)}
				</Form>
				<Divider />
				<Space>
					<Button type="primary" onClick={handleSubmit}>
						确定
					</Button>
					<Button onClick={() => window.history.back()}>取消</Button>
				</Space>
			</ProContent>
		</ProPage>
	);
}
