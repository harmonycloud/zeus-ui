import React from 'react';
import { Form, Modal, Alert, Input } from 'antd';
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
export default function CustomEditNodeSpe(props: NodeSpeProps): JSX.Element {
	const {
		visible,
		onCreate,
		onCancel,
		quota: { cpu, memory }
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
					style={{ marginBottom: 16 }}
				/>
				<FormItem label="CPU" name="cpu">
					<Input style={{ width: '140px' }} defaultValue={cpu} />
				</FormItem>
				<FormItem label="内存" name="memory">
					<Input style={{ width: '140px' }} defaultValue={memory} />
				</FormItem>
			</Form>
		</Modal>
	);
}
