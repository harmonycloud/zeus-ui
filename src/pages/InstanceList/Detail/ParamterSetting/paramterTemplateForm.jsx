import React, { useEffect, useState } from 'react';
import { Form, Dialog, Field, Select } from '@alicloud/console-components';
import { getParamTemp, getParamDetail } from '@/services/middleware';

const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};
const FormItem = Form.Item;
const { Option } = Select;

// const templates = [
// 	{ label: '系统默认', value: 'default' },
// 	{ label: '模板1', value: 'template1' },
// 	{ label: '模板2', value: 'template2' }
// ];

export default function ParamterTemplateForm(props) {
	const { visible, onCreate, onCancel, type } = props;
	const [templates, setTemplates] = useState();
	const [template, setTemplate] = useState();
	const field = Field.useField();

	useEffect(() => {
		getData(type);
	}, [type]);

	const getData = (type) => {
		const sendData = {
			type
		};
		getParamTemp(sendData).then((res) => {
			console.log(res);
			if (res.success) {
				setTemplates(res.data);
				setTemplate(res.data[0].name);
			}
		});
	};

	const onChange = (value) => {
		console.log(value);
		setTemplate(value);
	};

	const onOk = () => {
		field.validate((err, values) => {
			if (err) return;
			console.log(values);
			const sendData = {
				type,
				templateName: values.templateName
			};
			getParamDetail(sendData).then((res) => {
				console.log(res);
				if (res.success) {
					onCreate(res.data.customConfigList);
				}
			});
		});
	};

	return (
		<Dialog
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			title="参数模板"
			onClose={onCancel}
			footerAlign="right"
		>
			<Form {...formItemLayout} field={field}>
				<FormItem
					label="模板名称"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
				>
					<Select
						style={{ width: 300 }}
						name="templateName"
						value={template}
						onChange={onChange}
					>
						{templates &&
							templates.map((item) => {
								return (
									<Option key={item.name} value={item.name}>
										{item.aliasName}
									</Option>
								);
							})}
					</Select>
				</FormItem>
			</Form>
		</Dialog>
	);
}
