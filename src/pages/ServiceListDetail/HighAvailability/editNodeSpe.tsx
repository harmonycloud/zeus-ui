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
	// const field = Field.useField();
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
			// onClose={onCancel}
			// footerAlign="right"
		>
			<Form form={form} {...formItemLayout}>
				<Alert
					message="修改节点规格需要节点重启后生效，由此可能导致服务短暂中断，请谨慎操作。"
					type="warning"
				/>
				<FormItem label="CPU (Core)">
					<InputNumber
						type="inline"
						step="0.1"
						name="cpu"
						min={0}
						defaultValue={Number(cpu)}
					/>
				</FormItem>
				<FormItem label="内存 (GB)">
					<InputNumber
						type="inline"
						step="0.1"
						name="memory"
						min={0}
						defaultValue={Number(
							memory.substring(0, memory.length - 2)
						)}
					/>
				</FormItem>
				<FormItem label="存储 (GB)">
					<InputNumber
						disabled
						type="inline"
						step="0.1"
						name="storage"
						defaultValue={Number(
							storageClassQuota?.substring(
								0,
								storageClassQuota.length - 2
							)
						)}
					/>
				</FormItem>
			</Form>
		</Modal>
	);
}
