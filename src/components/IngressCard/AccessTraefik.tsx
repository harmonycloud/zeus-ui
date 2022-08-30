import { accessIngress, updateIngress } from '@/services/common';
import { getVIPs } from '@/services/ingress';
import pattern from '@/utils/pattern';
import { Form, Input, Modal, notification, Switch } from 'antd';
import React, { useEffect, useState } from 'react';

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
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				clusterId,
				type: 'traefik',
				...values
			};
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
				sendData.ingressName = values.ingressClassName;
			}
			if (data) {
				onCancel();
				updateIngress(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '负载均衡修改成功'
						});
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				onCancel();
				accessIngress(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '负载均衡接入成功'
						});
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
	return (
		<Modal
			visible={visible}
			onCancel={onCancel}
			title={data ? '编辑Traefik' : '接入Traefik'}
			onOk={onOk}
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
					name="ingressClassName"
				>
					<Input placeholder="请输入Traefik名称" />
				</FormItem>
				<FormItem
					label="Traefik分区"
					name="namespace"
					required
					rules={[{ required: true, message: '请输入Traefik分区' }]}
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
			</Form>
		</Modal>
	);
}
