import React from 'react';
import {
	Dialog,
	Field,
	Form,
	Message,
	Input,
	NumberPicker
} from '@alicloud/console-components';
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
	const field = Field.useField();
	const onOk = () => {
		field.validate((errors, values) => {
			console.log(values);
			if (errors) return;
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
		<Dialog
			title="工具安装"
			visible={visible}
			onClose={onCancel}
			onCancel={onCancel}
			onOk={onOk}
			style={{ width: '380px' }}
		>
			<Form field={field} {...formItemLayout}>
				<Form.Item label="vg名称" required requiredMessage="vg名称必填">
					<Input name="vgName" defaultValue="vg_middleware" />
				</Form.Item>
				<Form.Item label="配额" required requiredMessage="配额必填">
					<NumberPicker
						type="inline"
						name="size"
						style={{ width: '100%' }}
						min={1}
						defaultValue={100}
					/>
				</Form.Item>
			</Form>
		</Dialog>
	);
};

export default LvmInstallForm;
