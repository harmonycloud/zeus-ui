import React from 'react';
import {
	Dialog,
	Message,
	Form,
	Field,
	Input
} from '@alicloud/console-components';

interface AccessIngressProps {
	visible: boolean;
	onCancel: () => void;
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
const AccessIngressForm = (props: AccessIngressProps) => {
	const { visible, onCancel } = props;
	const field = Field.useField();
	const onOk = () => {
		console.log('ok');
		field.validate((errors, values) => {
			console.log(values);
		});
	};
	return (
		<Dialog
			title="接入服务暴露"
			style={{ width: 640 }}
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
		>
			<Form {...formItemLayout} field={field}>
				<FormItem
					label="Ingress名称"
					required
					requiredMessage="请输入Ingress名称"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
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
					label="Ingress地址"
					required
					requiredMessage="请输入Ingress地址"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
				>
					<Input
						htmlType="text"
						name="ingressAddress"
						trim={true}
						placeholder="请输入主机地址"
					/>
				</FormItem>
				<FormItem
					label="ConfigMap分区"
					required
					requiredMessage="请输入分区"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
				>
					<Input
						htmlType="text"
						name="namespace"
						trim={true}
						placeholder="请输入分区"
					/>
				</FormItem>
				<FormItem
					label="ConfigMap名称"
					required
					requiredMessage="请输入ConfigMap名称"
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
				>
					<Input
						htmlType="text"
						name="configMapName"
						trim={true}
						placeholder="请输入ConfigMap名称"
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
};
export default AccessIngressForm;
