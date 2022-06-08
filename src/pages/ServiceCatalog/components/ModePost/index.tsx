import React, { useEffect, useState } from 'react';
import { Form, notification, Select, InputNumber } from 'antd';
import { getIngresses } from '@/services/common';
import { AnyParams, ModePostProps } from './index.d';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';

const FormItem = Form.Item;
const Option = Select.Option;
export default function ModePost(props: ModePostProps): JSX.Element {
	const {
		mode,
		clusterId,
		form,
		middlewareName,
		middlewareType,
		customCluster
	} = props;
	console.log(props);
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
	const mqPosts = () => {
		if (mode === '2m-noslave') {
			const pt = {
				主节点0: null,
				主节点1: null,
				代理节点: null
			};
			setPosts(pt);
		}
		if (mode === '2m-2s') {
			const pt = {
				主节点0: null,
				从节点0: null,
				主节点1: null,
				从节点1: null,
				代理节点: null
			};
			setPosts(pt);
		}
		if (mode === '3m-3s') {
			const pt = {
				主节点0: null,
				从节点0: null,
				主节点1: null,
				从节点1: null,
				主节点2: null,
				从节点2: null,
				代理节点: null
			};
			setPosts(pt);
		}
	};
	const mqDataChange = () => {
		const at: any[] = [];
		Object.keys(posts).map((item: string, index: number) => {
			if (item.includes('主')) {
				at.push({
					serviceName: `${middlewareName}-${item.slice(-1)}-master`,
					exposePort: posts[item]
				});
			}
			if (item.includes('从')) {
				at.push({
					serviceName: `${middlewareName}-${item.slice(-1)}-slave`,
					exposePort: posts[item]
				});
			}
			if (item.includes('代理')) {
				at.push({
					serviceName: `${middlewareName}-nameserver-proxy-svc`,
					exposePort: posts[item]
				});
			}
		});
		setData({
			...data,
			serviceList: at
		});
	};
	const kfkPosts = (customCluster: number) => {
		const at = [];
		for (let i = 0; i < customCluster; i++) {
			at.push(i);
		}
		const pt = {};
		at.map((item: number) => {
			pt[`节点${item}`] = null;
		});
		setPosts(pt);
	};
	const kfkDataChange = () => {
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
	};
	useEffect(() => {
		if (middlewareType === 'rocketmq') {
			if (mode) {
				mqPosts();
			}
		}
	}, [mode]);
	useEffect(() => {
		if (middlewareType === 'kafka') {
			if (customCluster) {
				kfkPosts(customCluster);
			}
		}
	}, [customCluster]);
	useEffect(() => {
		if (posts) {
			switch (middlewareType) {
				case 'rocketmq':
					mqDataChange();
					break;
				case 'kafka':
					kfkDataChange();
					break;
				default:
					break;
			}
		}
	}, [posts, middlewareName]);
	useEffect(() => {
		form.setFieldsValue({
			ingresses: [data]
		});
	}, [data]);
	const onChange = (value: string | number, type: string, item?: string) => {
		switch (type) {
			case 'exposedWay':
				setExposedWay(value as string);
				setData({
					...data,
					exposeType: value
				});
				break;
			case 'ingressClassName':
				setData({
					...data,
					ingressClassName: value as string
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
			<li className="display-flex">
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
						<FormItem
							required
							rules={[
								{ required: true, message: '请选择Ingress！' }
							]}
						>
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
			<li className="display-flex">
				<label className="form-name">
					<span className="ne-required">填写服务端口</span>
				</label>
				<div className={`form-content`}>
					{Object.keys(posts).map((item: string) => {
						console.log(posts);
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
								<InputNumber
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
