import React from 'react';
import {
	Dialog,
	Message,
	Form,
	Field,
	Input
} from '@alicloud/console-components';
import { installIngress } from '@/services/common';
import messageConfig from '@/components/messageConfig';
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
	const field = Field.useField();
	const onOk = () => {
		field.validate((errors, values) => {
			if (errors) return;
			onCancel();
			installIngress({ ...values, clusterId }).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '服务暴露安装成功')
					);
					onRefresh();
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		});
	};
	return (
		<Dialog
			title="安装服务暴露"
			style={{ width: 640 }}
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
		>
			<Form {...formItemLayout} field={field}>
				<FormItem
					label="ingress名称"
					required
					requiredMessage="请输入Ingress名称"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					pattern={pattern.ingressName}
					patternMessage="请输入由小写字母数字及“-”组成的1-40个字符"
				>
					<Input
						htmlType="text"
						name="ingressClassName"
						trim={true}
						defaultValue="nginx-ingress-controller"
						placeholder="请输入Ingress名称"
					/>
				</FormItem>
				<FormItem
					label="http端口"
					required
					requiredMessage="请输入Ingress名称"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					min={1}
					max={65535}
					minmaxMessage="端口范围为1-65535"
				>
					<Input
						htmlType="number"
						name="httpPort"
						defaultValue={80}
						trim={true}
						min={1}
						max={65535}
						placeholder="请输入http端口"
					/>
				</FormItem>
				<FormItem
					label="https端口"
					required
					requiredMessage="请输入Ingress名称"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					min={1}
					max={65535}
					minmaxMessage="端口范围为1-65535"
				>
					<Input
						htmlType="number"
						name="httpsPort"
						trim={true}
						defaultValue={443}
						min={1}
						max={65535}
						placeholder="请输入https端口"
					/>
				</FormItem>
				<FormItem
					label="healthz端口"
					required
					requiredMessage="请输入Ingress名称"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					min={1}
					max={65535}
					minmaxMessage="端口范围为1-65535"
				>
					<Input
						htmlType="number"
						name="healthzPort"
						trim={true}
						defaultValue={10254}
						min={1}
						max={65535}
						placeholder="请输入healthz端口"
					/>
				</FormItem>
				<FormItem
					label="默认服务端口"
					required
					requiredMessage="请输入Ingress名称"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					min={1}
					max={65535}
					minmaxMessage="端口范围为1-65535"
				>
					<Input
						htmlType="number"
						name="defaultServerPort"
						trim={true}
						defaultValue={8181}
						min={1}
						max={65535}
						placeholder="请输入默认服务端口"
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
};
export default InstallIngressForm;
