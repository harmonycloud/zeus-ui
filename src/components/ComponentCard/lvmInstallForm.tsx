import React from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import { SendDataProps } from './index';

interface LvmInstallFormProps {
	visible: boolean;
	onCancel: () => void;
	title: string;
	clusterId: string;
	onRefresh: () => void;
	setRefreshCluster: (flag: boolean) => void;
	onCreate: (values: SendDataProps) => void;
}
const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};
const LvmInstallForm = (props: LvmInstallFormProps) => {
	const {
		visible,
		onCancel,
		clusterId,
		title,
		onCreate,
		setRefreshCluster,
		onRefresh
	} = props;
	// const field = Field.useField();
	const [form] = Form.useForm();
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				clusterId,
				componentName: title,
				...values
			};
			onCreate(sendData);
			setRefreshCluster(true);
			onCancel();
		});
	};
	return (
		<Modal
			title="工具安装"
			visible={visible}
			// onClose={onCancel}
			onCancel={onCancel}
			onOk={onOk}
			width={380}
			okText="确定"
			cancelText="取消"
			// style={{ width: '380px' }}
		>
			<Form form={form} {...formItemLayout}>
				<Form.Item
					name="vgName"
					label="vg名称"
					required
					rules={[{ required: true, message: 'vg名称必填' }]}
				>
					<Input defaultValue="vg_middleware" />
				</Form.Item>
				<Form.Item
					name="size"
					label="配额"
					required
					rules={[{ required: true, message: '配额必填' }]}
				>
					<InputNumber
						type="inline"
						style={{ width: '100%' }}
						min={1}
						defaultValue={100}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default LvmInstallForm;
