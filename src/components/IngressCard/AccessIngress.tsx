import React, { useEffect } from 'react';
import {
	Dialog,
	Message,
	Form,
	Field,
	Input
} from '@alicloud/console-components';
import { accessIngress, updateIngress } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import { IngressItemProps } from '@/pages/ResourcePoolManagement/resource.pool';

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
	const field = Field.useField();
	useEffect(() => {
		if (data) {
			field.setValues({ ...data });
		}
	}, [data]);
	const onOk = () => {
		field.validate((errors, values) => {
			if (errors) return;
			const value: FieldProps = field.getValues();
			const sendData: SendDataProps = {
				clusterId,
				...value
			};
			if (data) {
				sendData.id = data.id;
				sendData.ingressName = value.ingressClassName;
			}
			if (data) {
				updateIngress(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '服务暴露修改成功')
						);
						onCancel();
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			} else {
				accessIngress(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '服务暴露接入成功')
						);
						onCancel();
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
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
						name="address"
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
