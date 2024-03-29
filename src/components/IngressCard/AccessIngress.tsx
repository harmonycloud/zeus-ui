import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, notification, Switch, Space } from 'antd';
import { accessIngress, updateIngress } from '@/services/common';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
import { getVIPs } from '@/services/ingress';
import pattern from '@/utils/pattern';

interface AccessIngressProps {
	visible: boolean;
	clusterId: string;
	onCancel: () => void;
	onRefresh: () => void;
	data: IngressItemProps | undefined;
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
interface SendDataProps {
	clusterId: string;
	address: string | null;
	namespace: string;
	ingressClassName: string;
	configMapName: string;
	id?: number;
	ingressName?: string;
}
const AccessIngressForm = (props: AccessIngressProps) => {
	const { visible, onCancel, clusterId, onRefresh, data } = props;
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
					console.log(list);
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
			const sendData: SendDataProps = {
				clusterId,
				type: 'nginx',
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
			title={data ? '编辑Nginx' : '接入Nginx'}
			width={640}
			visible={visible}
			okText="确定"
			cancelText="取消"
			onCancel={onCancel}
			onOk={onOk}
		>
			<Form labelAlign="left" {...formItemLayout} form={form}>
				<FormItem
					label="Nginx名称"
					required
					rules={[
						{ required: true, message: '请输入Nginx名称' },
						{
							pattern: new RegExp(pattern.ingressName),
							message: '请输入由小写字母数字及“-”组成的1-40个字符'
						}
					]}
					initialValue="nginx-ingress-controller"
					name="ingressClassName"
				>
					<Input placeholder="请输入Nginx名称" />
				</FormItem>
				<FormItem
					label="Nginx分区"
					name="namespace"
					required
					rules={[
						{ required: true, message: '请输入Nginx分区' },
						{
							pattern: new RegExp(
								'^[a-z][a-z0-9-]{0,38}[a-z0-9]$'
							),
							message:
								'Nginx分区是由小写字母数字及“-”组成，且以小写字母开头和结尾，不能以“-”结尾的2-40个字符'
						}
					]}
				>
					<Input placeholder="请输入分区" />
				</FormItem>
				<FormItem
					label="配置文件名称"
					required
					name="configMapName"
					rules={[{ required: true, message: '请输入配置文件名称' }]}
				>
					<Input placeholder="仅支持Ingress-TCP，暂不支持Ingress-UDP" />
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
};
export default AccessIngressForm;
