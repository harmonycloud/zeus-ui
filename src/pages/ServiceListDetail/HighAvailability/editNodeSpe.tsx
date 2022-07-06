import React from 'react';
import { Form, Modal, InputNumber, Alert } from 'antd';
import { NodeSpeProps } from '../detail';

const formItemLayout = {
	labelCol: {
		span: 10
	},
	wrapperCol: {
		span: 14,
		offset: 2
	}
};
const FormItem = Form.Item;

export default function EditNodeSpe(props: NodeSpeProps): JSX.Element {
	const {
		visible,
		onCreate,
		onCancel,
		quota: { cpu, memory, storageClassQuota }
	} = props;
	const [form] = Form.useForm();

	const onOk = () => {
		form.validateFields().then((values) => {
			onCreate(values);
		});
	};

	return (
		<Modal
			title="修改节点规格"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
		>
			<Form form={form} {...formItemLayout} labelAlign="left">
				<Alert
					message="修改节点规格需要节点重启后生效，由此可能导致服务短暂中断，请谨慎操作。"
					type="warning"
					style={{ marginBottom: 16 }}
				/>
				<FormItem
					label="CPU (Core)"
					name="cpu"
					initialValue={Number(cpu)}
				>
					<InputNumber type="inline" step="0.1" min={0} />
				</FormItem>
				<FormItem
					label="内存 (GB)"
					name="memory"
					initialValue={Number(
						memory?.substring(0, memory.length - 2)
					)}
				>
					<InputNumber type="inline" step="0.1" min={0} />
				</FormItem>
				<FormItem
					label="存储 (GB)"
					name="storage"
					initialValue={Number(
						storageClassQuota?.substring(
							0,
							storageClassQuota.length - 2
						)
					)}
				>
					<InputNumber disabled type="inline" step="0.1" />
				</FormItem>
			</Form>
		</Modal>
	);
}
