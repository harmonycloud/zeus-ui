import React, { useEffect, useState } from 'react';
import { Form, Message, Select, Input } from '@alicloud/console-components';
import { getIngresses } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';

const FormItem = Form.Item;
const Option = Select.Option;
interface ModePostProps {
	mode: string;
	clusterId: string;
	middlewareName: string;
	field: any;
	middlewareType: string;
	customCluster: number;
}
interface AnyParams {
	[propsName: string]: any;
}

export default function ModePost(props: ModePostProps): JSX.Element {
	const {
		mode,
		clusterId,
		field,
		middlewareName,
		middlewareType,
		customCluster
	} = props;
	console.log(middlewareName);
	const [exposedWay, setExposedWay] = useState<string>('Ingress');
	const [protocol] = useState<string>('TCP');
	const [ingresses, setIngresses] = useState<IngressItemProps[]>([]);
	const [posts, setPosts] = useState<AnyParams>({});
	const [data, setData] = useState<AnyParams>({
		exposeType: 'Ingress',
		protocol: 'TCP',
		ingressClassName: '',
		middlewareType: middlewareType,
		serviceList: []
	});
	useEffect(() => {
		if (customCluster) {
			const at = [];
			for (let i = 0; i < customCluster; i++) {
				at.push(i);
			}
			const pt = {};
			at.map((item: number) => {
				pt[`节点${item}`] = null;
			});
			setPosts(pt);
		}
	}, [customCluster]);
	useEffect(() => {
		getIngresses({ clusterId: clusterId }).then((res) => {
			if (res.success) {
				setIngresses(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	useEffect(() => {
		if (posts) {
			const at: any[] = [];
			Object.keys(posts).map((item: string, index: number) => {
				at.push({
					serviceName: `${middlewareName}-kafka-external-svc-${index}`,
					exposePort: posts[item]
				});
			});
			setData({
				...data,
				serviceList: at
			});
		}
	}, [posts, middlewareName]);
	useEffect(() => {
		field.setValue('ingresses', [data]);
	}, [data]);
	const onChange = (value: string, type: string, item?: string) => {
		switch (type) {
			case 'exposedWay':
				setExposedWay(value);
				setData({
					...data,
					exposeType: value
				});
				break;
			case 'ingressClassName':
				setData({
					...data,
					ingressClassName: value
				});
				break;
			case 'exposePort':
				setPosts({
					...posts,
					[item as string]: value
				});
				break;
			default:
				break;
		}
	};
	return (
		<>
			<li className="display-flex" style={{ marginTop: 8 }}>
				<label className="form-name">
					<span className="ne-required">暴露方式</span>
				</label>
				<div className={`form-content display-flex`}>
					<FormItem>
						<Select
							onChange={(value) => onChange(value, 'exposedWay')}
							style={{ width: '120px', marginRight: 8 }}
							value={exposedWay}
						>
							<Option value="Ingress">Ingress</Option>
							<Option value="NodePort">NodePort</Option>
						</Select>
					</FormItem>
					{exposedWay === 'Ingress' && (
						<FormItem required requiredMessage="请选择Ingress！">
							<Select
								placeholder="请选择一个ingress"
								onChange={(value) =>
									onChange(value, 'ingressClassName')
								}
								style={{ width: '200px', marginRight: 8 }}
							>
								{ingresses.map(
									(item: IngressItemProps, index) => {
										return (
											<Option
												key={index}
												value={item.ingressClassName}
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
								style={{ width: '120px', marginRight: 8 }}
								value={protocol}
							>
								<Option value="TCP">TCP</Option>
							</Select>
						</FormItem>
					)}
				</div>
			</li>
			<li className="display-flex" style={{ marginTop: 8 }}>
				<label className="form-name">
					<span className="ne-required">填写服务端口</span>
				</label>
				<div className={`form-content`}>
					{Object.keys(posts).map((item: string) => {
						return (
							<div key={item} style={{ marginBottom: 8 }}>
								<span
									style={{
										display: 'inline-block',
										width: '100px'
									}}
								>
									{item}:
								</span>
								<Input
									htmlType="number"
									placeholder={
										exposedWay === 'Ingress'
											? '端口范围：30000-65535'
											: '端口范围：30000-32767'
									}
									min={30000}
									max={
										exposedWay === 'Ingress' ? 65535 : 32767
									}
									onChange={(value) =>
										onChange(value, 'exposePort', item)
									}
									style={{ width: '200px' }}
								/>
							</div>
						);
					})}
				</div>
			</li>
		</>
	);
}
