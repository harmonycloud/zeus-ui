import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import {
	Button,
	Divider,
	Form,
	InputNumber,
	Select,
	notification,
	Tag,
	Row,
	Col
} from 'antd';
import SelectCard from '@/components/SelectCard';
import {
	getIngresses,
	getIngressTCPPort,
	getNodePort
} from '@/services/common';
import { addIngress } from '@/services/ingress';
import { ServiceIngressAddParams } from '../detail';
import { getMiddlewareDetail } from '@/services/middleware';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
import { serviceAvailableItemProps } from '@/pages/ServiceAvailable/service.available';
import storage from '@/utils/storage';

const formItemLayout = {
	labelCol: {
		span: 3
	},
	wrapperCol: {
		span: 10
	}
};

export default function AddIngress(): JSX.Element {
	const [form] = Form.useForm();
	const params: ServiceIngressAddParams = useParams();
	const { name, namespace, middlewareName, clusterId, mode } = params;
	const [ingressType, setIngressType] = useState<string>(
		name === 'zookeeper' ? 'client' : 'read'
	);
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	const [exposeType, setExposeType] = useState<string>('TCP');
	const [serviceIngress] = useState<serviceAvailableItemProps>(
		storage.getSession('serviceIngress')
	);
	const [data, setData] = useState<any>();
	const [ingressClassName, setIngressClassName] = useState<{
		value: string;
		type: string;
		traefikPortList: any[];
	}>({
		value: '',
		type: '',
		traefikPortList: []
	});
	const [ingressPortArray, setIngressPortArray] = useState<string[]>([]);
	const [nodePortArray, setNodePortArray] = useState<string[]>([]);
	const ingressTypeList = [
		{
			label: '只读',
			value: 'read',
			icon: 'icon-zhidu'
		},
		{
			label: '读写',
			value: 'rw',
			icon: 'icon-duxie1'
		},
		{
			label: '读写分离',
			value: 'proxy',
			icon: 'icon-duxiefenli'
		}
	];
	const selectOptions = () => {
		if (name === 'mysql') {
			return data?.readWriteProxy?.enabled
				? ingressTypeList
				: [ingressTypeList[0], ingressTypeList[1]];
		} else if (name === 'redis') {
			return data?.readWriteProxy?.enabled
				? mode === 'sentinel'
					? [ingressTypeList[2]]
					: [ingressTypeList[1]]
				: [ingressTypeList[0], ingressTypeList[1]];
		} else if (name === 'postgresql') {
			return [ingressTypeList[0], ingressTypeList[1]];
		} else {
			return [
				{
					label: '服务连接',
					value: 'client',
					icon: 'icon-fuwulianjie'
				}
			];
		}
	};
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
		getData(clusterId, namespace);
		getIngressTCPPort().then((res) => {
			if (res.success) {
				setIngressPortArray(res.data.split('-'));
			}
		});
		getNodePort().then((res) => {
			if (res.success) {
				setNodePortArray(res.data.split('-'));
			}
		});
	}, []);
	useEffect(() => {
		if (serviceIngress) {
			const type = ingressTypeList.find(
				(item) => item.label === serviceIngress.servicePurpose
			)?.value;
			type && setIngressType(type);
			form.setFieldsValue({
				exposeType:
					serviceIngress.exposeType === 'Ingress'
						? 'TCP'
						: serviceIngress.exposeType,
				exposePort: +serviceIngress.serviceList[0].exposePort,
				ingressClassName: serviceIngress.ingressClassName
			});
			setExposeType(
				serviceIngress.exposeType === 'Ingress'
					? 'TCP'
					: serviceIngress.exposeType
			);
		}
		return () =>
			storage.getSession('serviceIngress') &&
			storage.removeSession('serviceIngress');
	}, []);

	const getData = (clusterId: string, namespace: string) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			type: name
		};
		getMiddlewareDetail(sendData).then((res) => {
			if (res.success) {
				setData(res.data);
				name === 'redis' &&
					res.data.readWriteProxy?.enabled &&
					mode === 'sentinel' &&
					setIngressType('proxy');
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const handleSubmit = () => {
		let service: string, servicePort: number;
		if (name === 'mysql') {
			servicePort = 3306;
			if (ingressType === 'read') {
				service = `${middlewareName}-readonly`;
			} else if (ingressType === 'proxy') {
				service = `${middlewareName}-proxy`;
			} else {
				service = `${middlewareName}`;
			}
		} else if (name === 'redis') {
			if (data?.readWriteProxy?.enabled) {
				if (mode === 'sentinel') {
					servicePort = ingressType === 'proxy' ? 7617 : 6379;
					service =
						ingressType === 'read'
							? `${middlewareName}-readonly`
							: ingressType === 'proxy'
							? `${middlewareName}-predixy`
							: middlewareName;
				} else {
					servicePort = 7617;
					service = `${middlewareName}-predixy`;
				}
			} else {
				servicePort = 6379;
				service =
					ingressType === 'read'
						? `${middlewareName}-readonly`
						: middlewareName;
			}
		} else if (name === 'postgresql') {
			servicePort = 5432;
			service =
				ingressType === 'read'
					? `${middlewareName}-repl`
					: middlewareName;
		} else {
			service = `${middlewareName}-client`;
			servicePort = 2181;
		}

		form.validateFields().then((values) => {
			for (
				let index = 0;
				index < ingressClassName?.traefikPortList.length;
				index++
			) {
				const element = ingressClassName?.traefikPortList[index];
				if (
					values.exposePort < element.startPort ||
					values.exposePort > element.endPort
				) {
					notification.error({
						message: '失败',
						description: '请输入规定范围以内的端口!'
					});
					return;
				}
			}
			let sendData: any = {
				clusterId,
				namespace,
				middlewareName,
				middlewareType: name,
				exposeType:
					values.exposeType === 'TCP' ? 'Ingress' : values.exposeType,
				protocol: values.exposeType === 'TCP' ? 'TCP' : null,
				ingressClassName: values.ingressClassName,
				serviceList: [
					{
						exposePort: values.exposePort,
						serviceName: service,
						servicePort,
						targetPort: servicePort
					}
				]
			};
			if (serviceIngress) {
				const serviceList = [
					{
						...sendData.serviceList[0],
						oldServicePort:
							serviceIngress.serviceList[0].servicePort,
						oldExposePort: serviceIngress.serviceList[0].exposePort,
						oldServiceName:
							serviceIngress.serviceList[0].serviceName
					}
				];
				sendData = {
					...sendData,
					name: serviceIngress.name
						? serviceIngress.name
						: serviceIngress.middlewareName
				};
				if (values.exposeType === 'TCP') {
					sendData = { ...sendData, serviceList };
				}
			}
			addIngress(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: `服务暴露${
							serviceIngress ? '修改' : '添加'
						}成功`
					});
					window.history.back();
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
			traefikPortList: cur?.traefikPortList || []
		});
	};
	return (
		<ProPage>
			<ProHeader
				title={`服务暴露${serviceIngress ? '编辑' : '新增'}`}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Form {...formItemLayout} labelAlign="left" form={form}>
					<h2>暴露服务</h2>
					<Form.Item
						label="暴露服务"
						rules={[
							{
								required: true,
								message: '请选择暴露服务'
							}
						]}
					>
						<SelectCard
							options={selectOptions()}
							disabled={!!serviceIngress}
							currentValue={ingressType}
							onCallBack={(value: any) => setIngressType(value)}
						/>
					</Form.Item>
					<h2>暴露方式</h2>
					<Form.Item
						label="暴露方式"
						name="exposeType"
						rules={[
							{
								required: true,
								message: '请选择暴露方式'
							}
						]}
						initialValue="TCP"
					>
						<Select
							placeholder="请选择暴露方式"
							value={exposeType}
							disabled={!!serviceIngress}
							onChange={(value) => setExposeType(value)}
						>
							<Select.Option value="NodePort" key="NodePort">
								NodePort
							</Select.Option>
							<Select.Option value="TCP" key="TCP">
								Ingress-TCP
							</Select.Option>
						</Select>
					</Form.Item>
					{exposeType === 'TCP' ? (
						<Form.Item
							label="负载均衡选择"
							name="ingressClassName"
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
								dropdownMatchSelectWidth={false}
								value={ingressClassName?.value}
								onChange={handleIngressChange}
							>
								{ingresses.map((item: IngressItemProps) => {
									return (
										<Select.Option
											key={item.ingressClassName}
											value={item.ingressClassName}
										>
											<div className="flex-space-between">
												{item.ingressClassName}
												<Tag
													color={
														item.type === 'nginx'
															? 'cyan'
															: 'green'
													}
												>
													{item.type}
												</Tag>
											</div>
										</Select.Option>
									);
								})}
							</Select>
						</Form.Item>
					) : null}
					<Form.Item
						label="对外端口配置"
						name="exposePort"
						rules={[
							{
								required: true,
								message: '请输入对外端口'
							}
						]}
					>
						<InputNumber
							placeholder={`请输入规定范围以内的端口`}
							style={{ width: 250 }}
						/>
					</Form.Item>
					{exposeType === 'TCP' &&
						ingressClassName?.type === 'traefik' && (
							<Row>
								<Col span={3}></Col>
								<Col span={10}>
									<div>
										当前负载均衡相关端口组为
										{ingressClassName.traefikPortList
											.map(
												(item) =>
													`${item.startPort}-${item.endPort}`
											)
											.join(',')}
										,请在端口组范围内选择端口
									</div>
								</Col>
							</Row>
						)}
					<Divider style={{ marginTop: 40 }} />
					<Button
						type="primary"
						onClick={handleSubmit}
						style={{ marginRight: 16 }}
					>
						确定
					</Button>
					<Button onClick={() => window.history.back()}>取消</Button>
				</Form>
			</ProContent>
		</ProPage>
	);
}
