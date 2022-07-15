import React, { useEffect, useState } from 'react';
import { ProHeader, ProPage, ProContent } from '@/components/ProPage';
import {
	Form,
	Input,
	Select,
	InputNumber,
	notification,
	Space,
	Switch
} from 'antd';
import { useParams } from 'react-router';
import { ServiceIngressAddParams, ServiceNameItem } from '../detail';
import FormBlock from '@/components/FormBlock';
import { getIngresses } from '@/services/common';
import { formItemLayout410 } from '@/utils/const';
import { IconFont } from '@/components/IconFont';
import './index.scss';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
const FormItem = Form.Item;
const Option = Select.Option;

// kfk mq es 的添加服务暴露页面
export default function ServiceDetailAddIngress(): JSX.Element {
	const params: ServiceIngressAddParams = useParams();
	const { name, namespace, middlewareName, clusterId, mode } = params;
	const [form] = Form.useForm();
	const [curServiceName, setCurServiceName] = useState<ServiceNameItem>();
	const [serviceNames, setServiceNames] = useState<ServiceNameItem[]>([]);
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	const [autoConfig, setAutoConfig] = useState<boolean>(false);
	useEffect(() => {
		if (name === 'kafka') {
			const list = [
				{
					name: 'cluster',
					label: '集群外访问',
					icon: 'icon-jiqunwaifangwen',
					port: null
				},
				{
					name: `${middlewareName}-manager-svc`,
					label: '管理页面',
					icon: 'icon-yemianguanli',
					port: 9000
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
	return (
		<ProPage>
			<ProHeader
				title="服务暴露新增"
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Form {...formItemLayout410} form={form} labelAlign="left">
					{name === 'elasticsearch' && (
						<FormBlock title="暴露方式">
							<FormItem
								label="暴露方式"
								name="exportWay"
								required
								initialValue="four"
							>
								<Select>
									<Option value="four">四层网络暴露</Option>
									<Option value="seven">七层网络暴露</Option>
								</Select>
							</FormItem>
						</FormBlock>
					)}
					<FormBlock title="暴露服务">
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
					</FormBlock>
					{curServiceName?.name === 'cluster' && (
						<FormBlock title="暴露配置">
							<FormItem required label="暴露方式">
								<Select>
									<Option value="NodePort">NodePort</Option>
									<Option value="TCP">TCP</Option>
								</Select>
							</FormItem>
							<FormItem required label="负载均衡选择">
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
							<FormItem label="NameServer端口配置" required>
								<InputNumber />
							</FormItem>
							<FormItem label="自动配置broker对外端口" required>
								<Switch
									checked={autoConfig}
									onChange={(checked: boolean) =>
										setAutoConfig(checked)
									}
								/>
							</FormItem>
						</FormBlock>
					)}
				</Form>
			</ProContent>
		</ProPage>
	);
}
