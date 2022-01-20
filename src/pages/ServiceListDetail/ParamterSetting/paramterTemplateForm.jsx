import React, { useEffect, useState } from 'react';
import {
	Form,
	Dialog,
	Field,
	Select,
	Message
} from '@alicloud/console-components';
import { getParamTemp, getParamDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { formItemLayout614 } from '@/utils/const';

const FormItem = Form.Item;
const { Option } = Select;

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
			if (res.success) {
				if (res.data.length > 0) {
					setTemplates(res.data);
					setTemplate(res.data[0].name);
				} else {
					Message.show(messageConfig('error', '失败', '暂无模板'));
				}
			}
		});
	};

	const onChange = (value) => {
		setTemplate(value);
	};

	const onOk = () => {
		field.validate((err, values) => {
			if (err) return;
			const sendData = {
				type,
				templateName: values.templateName
			};
			getParamDetail(sendData).then((res) => {
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
			<Form {...formItemLayout614} field={field}>
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
