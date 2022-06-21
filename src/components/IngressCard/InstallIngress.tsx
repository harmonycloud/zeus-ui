import React, { useEffect } from 'react';
import { Modal, notification, Form, Input, InputNumber } from 'antd';
import { installIngress } from '@/services/common';
import pattern from '@/utils/pattern';

interface InstallIngressProps {
	visible: boolean;
	clusterId: string;
	onCancel: () => void;
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
const InstallIngressForm = (props: InstallIngressProps) => {
	const { visible, onCancel, onRefresh, clusterId } = props;
	const [form] = Form.useForm();
	useEffect(() => {
		form.setFieldsValue({
			ingressClassName: 'nginx-ingress-controller',
			httpPort: 80,
			httpsPort: 443,
			healthzPort: 10254,
			defaultServerPort: 8181
		});
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			onCancel();
			// console.log({ ...values, clusterId });
			installIngress({ ...values, clusterId }).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '负载均衡成功'
					});
					onRefresh();
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
		<Modal
			title="安装负载均衡"
			width={640}
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			okText="确定"
			cancelText="取消"
		>
			<Form {...formItemLayout} labelAlign="left" form={form}>
				<FormItem
					label="ingress名称"
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
					<Input placeholder="请输入Ingress名称" />
				</FormItem>
				<FormItem
					label="http端口"
					required
					rules={[{ required: true, message: '请输入http端口' }]}
					name="httpPort"
				>
					<InputNumber
						step={1}
						min={1}
						max={65535}
						style={{ width: '100%' }}
						placeholder="请输入http端口"
					/>
				</FormItem>
				<FormItem
					label="https端口"
					required
					rules={[{ required: true, message: '请输入https端口' }]}
					name="httpsPort"
				>
					<InputNumber
						step={1}
						min={1}
						max={65535}
						style={{ width: '100%' }}
						placeholder="请输入https端口"
					/>
				</FormItem>
				<FormItem
					label="healthz端口"
					required
					rules={[{ required: true, message: '请输入healthz端口' }]}
					name="healthzPort"
				>
					<InputNumber
						step={1}
						min={1}
						max={65535}
						style={{ width: '100%' }}
						placeholder="请输入healthz端口"
					/>
				</FormItem>
				<FormItem
					label="默认服务端口"
					required
					rules={[{ required: true, message: '请输入默认服务端口' }]}
					name="defaultServerPort"
				>
					<InputNumber
						step={1}
						min={1}
						max={65535}
						style={{ width: '100%' }}
						placeholder="请输入默认服务端口"
					/>
				</FormItem>
			</Form>
		</Modal>
	);
};
export default InstallIngressForm;
