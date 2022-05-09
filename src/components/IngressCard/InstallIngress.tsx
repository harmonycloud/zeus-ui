import React from 'react';
import { Modal, notification, Form, Input } from 'antd';
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
	const onOk = () => {
		form.validateFields().then((values) => {
			onCancel();
			installIngress({ ...values, clusterId }).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '服务暴露安装成功'
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
			title="安装服务暴露"
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
				>
					<Input
						type="text"
						name="ingressClassName"
						// trim={true}
						defaultValue="nginx-ingress-controller"
						placeholder="请输入Ingress名称"
					/>
				</FormItem>
				<FormItem
					label="http端口"
					required
					rules={[
						{ required: true, message: '请输入http端口' },
						{ min: 1, message: '端口范围为1' },
						{ max: 65535, message: '端口范围为1-65535' }
					]}
				>
					<Input
						type="number"
						name="httpPort"
						defaultValue={80}
						// trim={true}
						min={1}
						max={65535}
						placeholder="请输入http端口"
					/>
				</FormItem>
				<FormItem
					label="https端口"
					required
					rules={[
						{ required: true, message: '请输入https端口' },
						{ min: 1, message: '端口范围为1' },
						{ max: 65535, message: '端口范围为1-65535' }
					]}
				>
					<Input
						type="number"
						name="httpsPort"
						// trim={true}
						defaultValue={443}
						min={1}
						max={65535}
						placeholder="请输入https端口"
					/>
				</FormItem>
				<FormItem
					label="healthz端口"
					required
					rules={[
						{ required: true, message: '请输入healthz端口' },
						{ min: 1, message: '端口范围为1' },
						{ max: 65535, message: '端口范围为1-65535' }
					]}
				>
					<Input
						type="number"
						name="healthzPort"
						// trim={true}
						defaultValue={10254}
						min={1}
						max={65535}
						placeholder="请输入healthz端口"
					/>
				</FormItem>
				<FormItem
					label="默认服务端口"
					required
					rules={[
						{ required: true, message: '请输入默认服务端口' },
						{ min: 1, message: '端口范围为1' },
						{ max: 65535, message: '端口范围为1-65535' }
					]}
				>
					<Input
						type="number"
						name="defaultServerPort"
						// trim={true}
						defaultValue={8181}
						min={1}
						max={65535}
						placeholder="请输入默认服务端口"
					/>
				</FormItem>
			</Form>
		</Modal>
	);
};
export default InstallIngressForm;
