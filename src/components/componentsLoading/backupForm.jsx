import React, { useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Select
} from '@alicloud/console-components';
import './index.scss';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
	labelCol: {
		fixedSpan: 8
	},
	wrapperCol: {
		span: 14
	}
};
export default function BackupForm(props) {
	const { visible, onCreate, onCancel } = props;
	const [head, setHead] = useState('http://');
	const [mid, setMid] = useState();
	const [tail, setTail] = useState();
	const field = Field.useField();
	const onOk = () => {
		field.validate((err, values) => {
			if (err) return;
			values.endpoint = head + mid + ':' + tail + '';
			onCreate(values);
		});
	};

	const handleChange = (value, type) => {
		switch (type) {
			case 'head':
				setHead(value);
				break;
			case 'mid':
				setMid(value);
				break;
			case 'tail':
				setTail(value);
				break;
			default:
				break;
		}
	};

	const select = (
		<Select onChange={(value) => handleChange(value, 'head')} value={head}>
			<Option value="https://">https://</Option>
			<Option value="http://">http://</Option>
		</Select>
	);
	const input = (
		<Input
			htmlType="number"
			onChange={(value) => handleChange(value, 'tail')}
			style={{ width: '80px' }}
			value={tail}
		/>
	);
	return (
		<Dialog
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			title="参数对接"
			style={{ width: '600px' }}
			footerAlign="right"
		>
			<Form {...formItemLayout} field={field}>
				<FormItem
					label="Access Key ID"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Input name="accessKeyId" />
				</FormItem>
				<FormItem
					label="Bucket名称"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Input name="bucketName" />
				</FormItem>
				<FormItem
					label="Minio名称"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Input name="name" />
				</FormItem>
				<FormItem
					label="Minio地址"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Input.Group addonBefore={select} addonAfter={input}>
						<Input
							style={{ width: '100%' }}
							value={mid}
							onChange={(value) => handleChange(value, 'mid')}
						/>
					</Input.Group>
				</FormItem>
				<FormItem
					label="Access Key Secret"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Input name="secretAccessKey" />
				</FormItem>
			</Form>
		</Dialog>
	);
}
