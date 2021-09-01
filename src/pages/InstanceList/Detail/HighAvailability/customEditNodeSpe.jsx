import React from 'react';
import {
	Form,
	Dialog,
	Field,
	Message,
	Input
} from '@alicloud/console-components';

const formItemLayout = {
	labelCol: {
		fixedSpan: 10
	},
	wrapperCol: {
		span: 14,
		offset: 2
	}
};
const FormItem = Form.Item;
export default function CustomEditNodeSpe(props) {
	const {
		visible,
		onCreate,
		onCancel,
		quota: { cpu, memory }
	} = props;
	const field = Field.useField();

	const onOk = () => {
		field.validate((err, value) => {
			onCreate(value);
		});
	};

	const onChange = () => {};

	return (
		<Dialog
			title="修改节点规格"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			footerAlign="right"
		>
			<Form field={field} {...formItemLayout}>
				<Message style={{ marginBottom: 24 }} type="warning">
					修改节点规格需要节点重启后生效，由此可能导致服务短暂中断，请谨慎操作。
				</Message>
				<FormItem label="CPU">
					<Input
						style={{ width: '140px' }}
						name="cpu"
						onChange={onChange}
						defaultValue={cpu}
					/>
				</FormItem>
				<FormItem label="内存">
					<Input
						style={{ width: '140px' }}
						name="memory"
						onChange={onChange}
						defaultValue={memory}
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
