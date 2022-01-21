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
		fixedSpan: 8
	},
	wrapperCol: {
		span: 16
	}
};
const FormItem = Form.Item;
interface DilatationFormProps {
	visible: boolean;
	onCancel: () => void;
	onCreate: () => void;
	quota: any;
}
export default function DilatationForm(
	props: DilatationFormProps
): JSX.Element {
	const { visible, onCreate, onCancel, quota } = props;
	console.log(props);
	const field = Field.useField();

	const onOk = () => {
		console.log('on');
	};

	return (
		<Dialog
			title="存储扩容"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			footerAlign="right"
		>
			<Form field={field} {...formItemLayout}>
				<FormItem label="存储 (GB)">
					<NumberPicker
						type="inline"
						step="0.1"
						name="storage"
						defaultValue={Number(
							quota.storageClassQuota.substring(
								0,
								quota.storageClassQuota.length - 2
							)
						)}
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
