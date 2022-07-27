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
	Divider,
	Alert
} from 'antd';
import { useParams, useHistory } from 'react-router';
import { ServiceIngressAddParams, ServiceNameItem } from '../detail';
import { getIngresses } from '@/services/common';
import { formItemLayout410 } from '@/utils/const';
import { IconFont } from '@/components/IconFont';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
import './index.scss';
import SelectBlock from '@/components/SelectBlock';
import { addIngress } from '@/services/ingress';
import { serviceAvailableItemProps } from '@/pages/ServiceAvailable/service.available';
import storage from '@/utils/storage';

const FormItem = Form.Item;
const Option = Select.Option;
const fourNetworkIngress = [
	{ value: 'TCP', label: 'Ingress-TCP' },
	{ value: 'NodePort', label: 'NodePort' }
];
function getIndex(x: number): number {
	switch (x) {
		case 0:
			return 0;
		case 1:
			return 0;
		case 2:
			return 1;
		case 3:
			return 1;
		case 4:
			return 2;
		case 5:
			return 2;
		default:
			return 0;
	}
}
// ! kfk mq 的添加服务暴露页面
export default function ServiceDetailAddIngress(): JSX.Element {
	const params: ServiceIngressAddParams = useParams();
	const history = useHistory();
	const {
		name,
		namespace,
		middlewareName,
		clusterId,
		brokerNum,
		aliasName,
		chartVersion,
		enableExternal,
		mode
	} = params;
	const [form] = Form.useForm();
	const [curServiceName, setCurServiceName] = useState<ServiceNameItem>();
	const [serviceNames, setServiceNames] = useState<ServiceNameItem[]>([]);
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	const [autoConfig, setAutoConfig] = useState<boolean>(true);
	const [exposeType, setExposeType] = useState<string>('TCP');
	const [brokers, setBrokers] = useState<number[]>([]);
	const [networkIngress, setNetworkIngress] = useState<number>(4);
	const [serviceIngress] = useState<serviceAvailableItemProps>(
		storage.getSession('serviceIngress')
	);
	useEffect(() => {
		if (serviceIngress) {
			setExposeType(
				serviceIngress.exposeType === 'Ingress'
					? 'TCP'
					: serviceIngress.exposeType
			);
			if (serviceIngress.protocol === 'HTTP') {
				setCurServiceName({
					name: serviceIngress.rules[0]?.ingressHttpPaths?.[0]
						.serviceName,
					label: '管理页面',
					icon: 'icon-yemianguanli'
				});
			} else {
				setCurServiceName({
					name: serviceIngress.serviceList?.[0]?.serviceName,
					label:
						serviceIngress.servicePurpose === '服务连接'
							? '集群外访问'
							: '管理页面',
					icon:
						serviceIngress.servicePurpose === '服务连接'
							? 'icon-jiqunwaifangwen'
							: 'icon-yemianguanli'
				});
			}
			setNetworkIngress(serviceIngress.networkModel);
			form.setFieldsValue({
				exposeType:
					serviceIngress.exposeType === 'Ingress'
						? 'TCP'
						: serviceIngress.exposeType,
				ingressClassName: serviceIngress.ingressClassName,
				exposePort: Number(serviceIngress.serviceList?.[0].exposePort),
				networkModel: serviceIngress.networkModel,
				domain: serviceIngress.rules?.[0].domain,
				path: serviceIngress.rules?.[0]?.ingressHttpPaths?.[0]?.path
			});
		}
		return () => {
			storage.getSession('serviceIngress') &&
				storage.removeSession('serviceIngress');
		};
	}, []);
	useEffect(() => {
		if (name === 'kafka') {
			let list = [
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
			if (enableExternal === 'true' || mode === 'dledger') {
				list = list.filter((item) => item.name !== 'cluster');
			}
			setServiceNames(list);
			!serviceIngress && setCurServiceName(list[0]);
		} else if (name === 'rocketmq') {
			let list = [
				{
					name: 'cluster',
					label: '集群外访问',
					icon: 'icon-jiqunwaifangwen'
				},
				{
					name: `${middlewareName}-console-svc`,
					label: '管理页面',
					icon: 'icon-yemianguanli'
				}
			];
			const at = [];
			for (let i = 0; i < Number(brokerNum); i++) {
				at.push(i);
			}
			setBrokers(at);
			if (enableExternal === 'true' || mode === 'dledger') {
				list = list.filter((item) => item.name !== 'cluster');
			}
			setServiceNames(list);
			!serviceIngress && setCurServiceName(list[0]);
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
			const lt = [];
			let edit = {};
			let old = {};
			let sendData = {};
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
			// * 集群外访问
			if (curServiceName?.name === 'cluster') {
				if (autoConfig) {
					if (name === 'kafka') {
						for (let i = 0; i < Number(brokerNum); i++) {
							lt.push({
								serviceName: `${middlewareName}-kafka-external-svc-${i}`,
								exposePort: null
							});
						}
					} else {
						for (let i = 0; i < Number(brokerNum); i++) {
							if ((i + 1) % 2 === 1) {
								lt.push({
									serviceName: `${middlewareName}-${getIndex(
										i
									)}-master`,
									exposePort: null
								});
							} else {
								lt.push({
									serviceName: `${middlewareName}-${getIndex(
										i
									)}-slave`,
									exposePort: null
								});
							}
						}
						for (let i = 0; i < 2; i++) {
							lt.push({
								serviceName: `${middlewareName}nameserver-proxy-svc-${i}`,
								exposePort: values[`exposePort${i}`]
							});
						}
					}
				} else {
					if (name === 'kafka') {
						for (let i = 0; i < Number(brokerNum); i++) {
							lt.push({
								serviceName: `${middlewareName}-kafka-external-svc-${i}`,
								exposePort: values[`brokerPort${i}`]
							});
						}
					} else {
						for (let i = 0; i < Number(brokerNum); i++) {
							if ((i + 1) % 2 === 1) {
								lt.push({
									serviceName: `${middlewareName}-${getIndex(
										i
									)}-master`,
									exposePort: values[`brokerPort${i}`]
								});
							} else {
								lt.push({
									serviceName: `${middlewareName}-${getIndex(
										i
									)}-slave`,
									exposePort: values[`brokerPort${i}`]
								});
							}
						}
						for (let i = 0; i < 2; i++) {
							lt.push({
								serviceName: `${middlewareName}nameserver-proxy-svc-${i}`,
								exposePort: values[`exposePort${i}`]
							});
						}
					}
				}
				sendData = {
					...edit,
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
			} else {
				// * 管理页面
				if (values.networkModel === 4) {
					// 4层网络暴露
					sendData = {
						...edit,
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
								serviceName: `${middlewareName}-${
									name === 'kafka' ? 'manager' : 'console'
								}-svc`,
								exposePort: values.exposePort,
								servicePort: name === 'kafka' ? 9000 : 8080,
								targetPort: name === 'kafka' ? 9000 : 8080,
								...old
							}
						]
					};
				} else {
					// 7层网络暴露
					sendData = {
						...edit,
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
										serviceName: `${middlewareName}-${
											name === 'kafka'
												? 'manager'
												: 'console'
										}-svc`,
										servicePort:
											name === 'kafka' ? 9000 : 8080
									}
								]
							}
						]
					};
				}
			}
			console.log(sendData);
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
	return (
		<ProPage>
			<ProHeader
				title={`服务暴露${serviceIngress ? '编辑' : '新增'}`}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				{enableExternal === 'false' && mode !== 'dledger' && (
					<Alert
						message="您好！选择集群外访问服务暴露后需要重启服务！"
						type="info"
						showIcon
						style={{ marginBottom: 8 }}
					/>
				)}
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
												curServiceName?.name?.includes(
													item.name
												)
													? 'ingress-service-box-active'
													: ''
											}`}
											style={{
												background: !serviceIngress
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
										placeholder="请选择负载均衡"
										disabled={!!serviceIngress}
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
														{item.ingressClassName}
													</Option>
												);
											}
										)}
									</Select>
								</FormItem>
							)}
							{name === 'rocketmq' && (
								<>
									<FormItem
										label="proxy-0端口配置"
										required
										name="exposePort0"
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
											placeholder="请填写proxy端口"
											disabled={!!serviceIngress}
											style={{ width: '260px' }}
										/>
									</FormItem>
									<FormItem
										label="proxy-1端口配置"
										required
										name="exposePort1"
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
											placeholder="请填写proxy-1端口"
											disabled={!!serviceIngress}
											style={{ width: '260px' }}
										/>
									</FormItem>
								</>
							)}
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
													},
													{
														required: true,
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
					{(curServiceName?.name.includes(
						`${middlewareName}-console-svc`
					) ||
						curServiceName?.name.includes(
							`${middlewareName}-manager-svc`
						)) && (
						<>
							<h2>暴露配置</h2>
							<FormItem
								label="暴露方式"
								name="networkModel"
								required
								initialValue={4}
							>
								<Select
									disabled={!!serviceIngress}
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
											disabled={!!serviceIngress}
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
											rules={[
												{
													required: true,
													message: '请选择负载均衡'
												}
											]}
										>
											<Select
												placeholder="请选择负载均衡"
												disabled={!!serviceIngress}
											>
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
										rules={[
											{
												required: true,
												message: '请选择负载均衡'
											}
										]}
									>
										<Select
											placeholder="请选择负载均衡"
											disabled={!!serviceIngress}
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
										rules={[
											{
												required: true,
												message: '请输入域名和路径'
											}
										]}
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
