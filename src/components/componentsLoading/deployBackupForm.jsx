import React from 'react';
import { Dialog, Form, Field, Input } from '@alicloud/console-components';
import './index.scss';

const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		fixedSpan: 8
	},
	wrapperCol: {
		span: 14
	}
};

export default function DeployBackupForm(props) {
	const { visible, onCreate, onCancel } = props;
	const field = Field.useField();
	const onOk = () => {
		field.validate((err, values) => {
			if (err) return;
			onCreate(values);
		});
	};
	return (
		<Dialog
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			title="部署参数"
			style={{ width: '600px' }}
			footerAlign="right"
		>
			<Form {...formItemLayout} field={field}>
				<FormItem
					label="Minio对外访问端口"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
					min={3000}
					max={39000}
					minmaxMessage="端口范围为3000-39000正整数"
				>
					<Input
						name="port"
						htmlType="number"
						step={1}
						placeholder="请输入端口号"
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
