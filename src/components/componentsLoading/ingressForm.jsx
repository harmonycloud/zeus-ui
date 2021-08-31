import React, { useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Switch
} from '@alicloud/console-components';

const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		fixedSpan: 8
	},
	wrapperCol: {
		span: 14
	}
};
export default function IngressForm(props) {
	const { visible, onCreate, onCancel } = props;
	const [enables, setEnabled] = useState(true);
	const field = Field.useField();
	const onOk = () => {
		field.validate((err, values) => {
			if (err) return;
			onCreate(values);
		});
	};
	const onChange = (value) => {
		setEnabled(value);
	};

	return (
		<Dialog
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			title="参数对接"
			style={{ width: '480px' }}
			footerAlign="right"
		>
			<Form {...formItemLayout} field={field}>
				<FormItem
					label="ingress地址"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Input name="address" placeholder="请输入地址" />
				</FormItem>
				<FormItem
					label="TCP"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Switch
						name="enabled"
						value={enables}
						onChange={onChange}
					/>
				</FormItem>
				{enables && (
					<>
						<FormItem
							label="配置文件名称"
							required
							labelTextAlign="left"
							asterisk={false}
							className="ne-required-ingress"
						>
							<Input
								name="configMapName"
								placeholder="请输入配置文件名称"
							/>
						</FormItem>
						<FormItem
							label="命名空间"
							required
							labelTextAlign="left"
							asterisk={false}
							className="ne-required-ingress"
						>
							<Input
								name="namespace"
								placeholder="请输入命名空间"
							/>
						</FormItem>
					</>
				)}
			</Form>
		</Dialog>
	);
}
