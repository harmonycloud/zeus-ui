import React, { useEffect, useState } from 'react';
import { Modal, Form, InputNumber, notification } from 'antd';
import { addIngress } from '@/services/ingress';
import { formItemLayout614 } from '@/utils/const';
import storage from '@/utils/storage';
import { serviceAvailableItemProps } from '@/pages/ServiceAvailable/service.available';

interface EditPortFormProps {
	visible: boolean;
	onCancel: () => void;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	onRefresh: () => void;
}
export default function EditPortForm(props: EditPortFormProps): JSX.Element {
	const {
		visible,
		onCancel,
		clusterId,
		namespace,
		middlewareName,
		onRefresh
	} = props;
	const [form] = Form.useForm();
	const [serviceIngress] = useState<serviceAvailableItemProps>(
		storage.getSession('serviceIngress')
	);
	useEffect(() => {
		if (serviceIngress) {
			form.setFieldsValue({
				port: serviceIngress.serviceList[0].exposePort
			});
		}
		return () => {
			storage.getSession('serviceIngress') &&
				storage.removeSession('serviceIngress');
		};
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			console.log(values);
			const sendData = {
				name: serviceIngress.name,
				clusterId,
				namespace,
				middlewareName,
				exposeType: serviceIngress.exposeType,
				middlewareType: serviceIngress.middlewareType,
				ingressClassName: serviceIngress.ingressClassName,
				protocol: serviceIngress.protocol,
				serviceList: [
					{
						serviceName: serviceIngress.serviceList[0].serviceName,
						exposePort: values.port,
						servicePort: serviceIngress.serviceList[0].servicePort,
						oldServicePort:
							serviceIngress.serviceList[0].servicePort,
						oldExposePort: serviceIngress.serviceList[0].exposePort,
						oldServiceName:
							serviceIngress.serviceList[0].serviceName
					}
				]
			};
			onCancel();
			addIngress(sendData).then((res) => {
				if (res.success) {
					onRefresh();
					notification.success({
						message: '成功',
						description: '服务暴露编辑成功'
					});
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
			title="编辑暴露端口"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
		>
			<Form form={form} labelAlign="left" {...formItemLayout614}>
				<Form.Item
					name="port"
					label="暴露端口"
					required
					rules={[
						{ required: true, message: '请填写暴露端口' },
						{
							min: 30000,
							max: 65535,
							type: 'number',
							message: '请输入符合规定的端口号'
						}
					]}
				>
					<InputNumber
						placeholder="请输入30000-65535以内的端口"
						style={{ width: '260px' }}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
