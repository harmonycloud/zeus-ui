import React from 'react';
import {
	Form,
	Dialog,
	Field,
	Message,
	NumberPicker
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

export default function EditNodeSpe(props) {
	const {
		visible,
		onCreate,
		onCancel,
		quota: { cpu, memory, storageClassQuota }
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
				<FormItem label="CPU (Core)">
					<NumberPicker
						type="inline"
						onChange={onChange}
						step="0.1"
						name="cpu"
						min={0}
						defaultValue={Number(cpu)}
					/>
				</FormItem>
				<FormItem label="内存 (GB)">
					<NumberPicker
						type="inline"
						step="0.1"
						name="memory"
						onChange={onChange}
						min={0}
						defaultValue={Number(
							memory.substring(0, memory.length - 2)
						)}
					/>
				</FormItem>
				<FormItem label="存储 (GB)">
					<NumberPicker
						disabled
						type="inline"
						step="0.1"
						name="storage"
						onChange={onChange}
						defaultValue={Number(
							storageClassQuota.substring(
								0,
								storageClassQuota.length - 2
							)
						)}
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
