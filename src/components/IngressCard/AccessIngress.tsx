import React, { useEffect } from 'react';
import { Modal, Form, Input, notification } from 'antd';
import { accessIngress, updateIngress } from '@/services/common';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';
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
interface FieldProps {
	ingressClassName: string;
	address: string;
	namespace: string;
	configMapName: string;
}
const FormItem = Form.Item;
interface SendDataProps {
	clusterId: string;
	address: string;
	namespace: string;
	ingressClassName: string;
	configMapName: string;
	id?: number;
	ingressName?: string;
}
const AccessIngressForm = (props: AccessIngressProps) => {
	const { visible, onCancel, clusterId, onRefresh, data } = props;
	// const field = Field.useField();
	const [form] = Form.useForm();
	useEffect(() => {
		if (data) {
			form.setFieldsValue({
				...data
			});
		}
	}, [data]);
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData: SendDataProps = {
				clusterId,
				...values
			};
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
							description: '服务暴露修改成功'
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
							description: '服务暴露接入成功'
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
			title={data ? '编辑服务暴露' : '接入服务暴露'}
			width={640}
			visible={visible}
			okText="确定"
			cancelText="取消"
			onCancel={onCancel}
			onOk={onOk}
		>
			<Form labelAlign="left" {...formItemLayout} form={form}>
				<FormItem
					label="Ingress名称"
					required
					rules={[
						{ required: true, message: '请输入Ingress名称' },
						{
							pattern: new RegExp(pattern.ingressName),
							message: '请输入由小写字母数字及“-”组成的1-40个字符'
						}
					]}
					name="ingressClassName"
				>
					<Input
						defaultValue="nginx-ingress-controller"
						placeholder="请输入Ingress名称"
					/>
				</FormItem>
				<FormItem
					label="Ingress地址"
					required
					rules={[{ required: true, message: '请输入Ingress地址' }]}
					name="address"
				>
					<Input placeholder="请输入主机地址" />
				</FormItem>
				<FormItem
					label="ConfigMap分区"
					name="namespace"
					required
					rules={[{ required: true, message: '请输入分区' }]}
				>
					<Input placeholder="请输入分区" />
				</FormItem>
				<FormItem
					label="ConfigMap名称"
					required
					name="configMapName"
					rules={[{ required: true, message: '请输入ConfigMap名称' }]}
				>
					<Input placeholder="请输入ConfigMap名称" />
				</FormItem>
			</Form>
		</Modal>
	);
};
export default AccessIngressForm;
