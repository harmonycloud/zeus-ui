import { accessIngress, updateIngress } from '@/services/common';
import { checkTraefikPort, getVIPs } from '@/services/ingress';
import pattern from '@/utils/pattern';
import { PlusOutlined } from '@ant-design/icons';
import {
	Button,
	Checkbox,
	Col,
	Form,
	Input,
	Modal,
	notification,
	Row,
	Space,
	Switch,
	Tag
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import React, { useEffect, useState } from 'react';
import NumberRange from '../NumberRange';

interface AccessTraefikProps {
	visible: boolean;
	onCancel: () => void;
	data: any;
	clusterId: string;
	onRefresh: () => void;
}
const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};
const FormItem = Form.Item;
export default function AccessTraefik(props: AccessTraefikProps): JSX.Element {
	const { visible, onCancel, data, clusterId, onRefresh } = props;
	const [form] = Form.useForm();
	const [vipChecked, setVIPChecked] = useState<boolean>(false);
	const [vips, setVIPs] = useState<string[]>([]);
	const [vipNoAlive, setVIPNoAlive] = useState<boolean>(false);
	const [address, setAddress] = useState<string>('');
	const [traefikPortList, setTraefikPortList] = useState<any[]>([]);
	const [portRange, setPortRange] = useState<any>();
	const [skipPortConflict, setSkipPortConflict] = useState<boolean>(false);
	useEffect(() => {
		getVIPs({ clusterId }).then((res) => {
			if (res.success) {
				if (data) {
					const list = res.data.filter(
						(item: string) => item !== data.address
					);
					setVIPs(list);
				} else {
					setVIPs(res.data);
				}
			}
		});
	}, []);
	useEffect(() => {
		if (data) {
			if (data.address) {
				setVIPChecked(true);
				setAddress(data.address);
			}
			form.setFieldsValue({
				...data
			});
			setTraefikPortList(data.traefikPortList || []);
		}
	}, [data]);
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setAddress(event.target.value);
		if (event.target.value === '') {
			setVIPNoAlive(true);
		} else {
			setVIPNoAlive(false);
		}
	};
	const onChange = (e: CheckboxChangeEvent) => {
		setSkipPortConflict(e.target.checked);
	};
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				clusterId,
				type: 'traefik',
				...values,
				ingressClassName: values.name,
				traefikPortList: traefikPortList
			};
			if (data && traefikPortList?.length === 0) {
				notification.error({
					message: '错误',
					description: '服务端口范围不能为空'
				});
				return;
			}
			if (!skipPortConflict) {
				if (
					traefikPortList?.length &&
					traefikPortList?.some(
						(item: any) => item.ports !== '[]' && item.ports
					)
				) {
					notification.error({
						message: '错误',
						description:
							'当前端口组存在冲突，请重新输入或勾选强制跳过冲突端口！'
					});
					return;
				}
			}
			if (vipChecked && address === '') {
				setVIPNoAlive(true);
				return;
			}
			if (!vipChecked) {
				sendData.address = null;
			} else {
				sendData.address = address;
			}
			if (data) {
				sendData.id = data.id;
				sendData.ingressName = data.ingressClassName;
			}
			if (data) {
				updateIngress(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '负载均衡修改成功'
						});
						onCancel();
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				accessIngress(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '负载均衡接入成功'
						});
						onCancel();
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};
	const numberRange = (value: string[]) => {
		if (value[0] !== '' && value[1] !== '') {
			let result: any = {
				endPort: value[1],
				startPort: value[0]
			};
			if (traefikPortList?.length === 0) {
				setPortRange(result);
				return;
			}
			traefikPortList?.forEach((item) => {
				if (
					(result.startPort >= item.startPort &&
						result.startPort <= item.endPort) ||
					(result.endPort >= item.startPort &&
						result.endPort <= item.endPort) ||
					(result.startPort <= item.startPort &&
						result.endPort >= item.endPort)
				) {
					notification.error({
						message: '失败',
						description: '端口范围设置错误！'
					});
					result = {};
				}
			});
			setPortRange(result);
		}
	};
	return (
		<Modal
			visible={visible}
			onCancel={onCancel}
			title={data ? '编辑Traefik' : '接入Traefik'}
			onOk={onOk}
			width={640}
		>
			<Form form={form} labelAlign="left" {...formItemLayout}>
				<FormItem
					label="Traefik名称"
					required
					rules={[
						{ required: true, message: '请输入Traefik名称' },
						{
							pattern: new RegExp(pattern.ingressName),
							message: '请输入由小写字母数字及“-”组成的1-40个字符'
						}
					]}
					initialValue="traefik-controller"
					name="name"
				>
					<Input placeholder="请输入Traefik名称" />
				</FormItem>
				<FormItem
					label="Traefik分区"
					name="namespace"
					required
					rules={[
						{ required: true, message: '请输入Traefik分区' },
						{
							pattern: new RegExp(
								'^[a-z][a-z0-9-]{0,38}[a-z0-9]$'
							),
							message:
								'Traefik分区是由小写字母数字及“-”组成，且以小写字母开头和结尾，不能以“-”结尾的2-40个字符'
						}
					]}
				>
					<Input placeholder="请输入Traefik分区" />
				</FormItem>
				<FormItem label="VIP配置" required name="address">
					<div className="display-flex flex-align">
						<Switch
							checked={vipChecked}
							onChange={(check: boolean) => {
								setVIPChecked(check);
							}}
						/>
						{vipChecked && (
							<Input
								value={address}
								onChange={handleChange}
								style={{ width: '100%', marginLeft: 8 }}
								placeholder="请输入VIP地址"
								status={
									vipNoAlive
										? 'error'
										: vips.find((item) => item === address)
										? 'error'
										: ''
								}
							/>
						)}
					</div>
					{vipChecked && vips.find((item) => item === address) && (
						<div
							style={{
								marginLeft: 52,
								color: '#ff4d4f'
							}}
						>
							当前VIP地址已经被配置
						</div>
					)}
					{vipChecked && vipNoAlive && (
						<div
							style={{
								marginLeft: 52,
								color: '#ff4d4f'
							}}
						>
							请输入VIP地址
						</div>
					)}
				</FormItem>
				{console.log(portRange, traefikPortList)}
				{data ? (
					<FormItem label="服务端口选择" required>
						<FormItem noStyle name="rangePort">
							<Space>
								<NumberRange
									style={{ width: '300px' }}
									unit={''}
									numberRange={numberRange}
								/>
								<Button
									onClick={() => {
										if (
											JSON.stringify(portRange) !== '{}'
										) {
											if (
												portRange.startPort >
												portRange.endPort
											) {
												notification.error({
													message: '失败',
													description:
														'端口范围设置错误！'
												});
												return;
											}
											if (traefikPortList?.length === 0) {
												checkTraefikPort({
													clusterId,
													startPort:
														portRange.startPort,
													endPort: portRange.endPort
												}).then((res) => {
													if (res.success) {
														const result =
															portRange;
														result.ports = res.data;
														setTraefikPortList([
															...traefikPortList,
															result
														]);
													}
												});
												return;
											}
											traefikPortList?.forEach((item) => {
												if (
													(portRange.startPort >=
														item.startPort &&
														portRange.startPort <=
															item.endPort) ||
													(portRange.endPort >=
														item.startPort &&
														portRange.endPort <=
															item.endPort) ||
													(portRange.startPort <=
														item.startPort &&
														portRange.endPort >=
															item.endPort)
												) {
													notification.error({
														message: '失败',
														description:
															'端口范围设置错误！'
													});
													return;
												}
											});
											checkTraefikPort({
												clusterId,
												startPort: portRange.startPort,
												endPort: portRange.endPort
											}).then((res) => {
												if (res.success) {
													const result = portRange;
													result.ports = res.data;
													traefikPortList.length &&
														!traefikPortList.find(
															(item) =>
																item.startPort ===
																	result.startPort &&
																item.endPort ===
																	result.endPort
														) &&
														setTraefikPortList([
															...traefikPortList,
															result
														]);
												}
											});
										}
									}}
									shape="default"
									icon={<PlusOutlined />}
								/>
							</Space>
						</FormItem>
						<FormItem noStyle name="skipPortConflict">
							<Checkbox
								style={{ marginLeft: 24 }}
								checked={skipPortConflict}
								onChange={onChange}
							>
								跳过冲突端口
							</Checkbox>
						</FormItem>
					</FormItem>
				) : null}
				{traefikPortList?.length > 0 && (
					<Row>
						<Col span={3}></Col>
						<Col span={21}>
							<div className="tag-box">
								<Space wrap>
									{traefikPortList?.map((item: any) => (
										<Tag
											key={`${item.startPort}-${item.endPort}`}
											closable
											style={{
												padding: '4px 10px'
											}}
											onClose={() => {
												const list =
													traefikPortList?.filter(
														(i) =>
															`${i.startPort}-${i.endPort}` !==
															`${item.startPort}-${item.endPort}`
													);
												setTraefikPortList(list);
											}}
										>
											{item.startPort}-{item.endPort}
										</Tag>
									))}
								</Space>
							</div>
						</Col>
					</Row>
				)}
				{traefikPortList?.length > 0 &&
					traefikPortList?.map((item, index) => {
						return (
							<Row key={index}>
								<Col span={5}></Col>
								<Col>
									<div>
										当前选择的服务端口组是
										{item.startPort}-{item.endPort}
									</div>
									{item.ports === '[]' && (
										<div>其中没有端口被占用！</div>
									)}
									{item.ports &&
										!skipPortConflict &&
										item.ports !== '[]' && (
											<div style={{ color: '#ff4d4f' }}>
												其中{item.ports}
												端口号被占用，请重新输入
											</div>
										)}
									{item.ports &&
										skipPortConflict &&
										item.ports !== '[]' && (
											<div style={{ color: '#ff4d4f' }}>
												其中{item.ports}
												端口号被占用，已跳过冲突端口
											</div>
										)}
								</Col>
							</Row>
						);
					})}
			</Form>
		</Modal>
	);
}
