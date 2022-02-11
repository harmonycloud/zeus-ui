import React, { useEffect, useState } from 'react';
import {
	Form,
	Dialog,
	Field,
	Select,
	Message
} from '@alicloud/console-components';
import { getParamsTemps, getParamsTemp } from '@/services/template';
// import { getParamTemp, getParamDetail } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';

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
	const { visible, onCreate, onCancel, type, chartVersion } = props;
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
		getParamsTemps(sendData).then((res) => {
			// console.log(res);
			if (res.success) {
				if (res.data.length > 0) {
					setTemplates(res.data);
				} else {
					Message.show(messageConfig('error', '失败', '暂无模板'));
				}
			}
		});
	};

	const onChange = (value) => {
		// console.log(value);
		setTemplate(value);
	};

	const onOk = () => {
		field.validate((err, values) => {
			if (err) return;
			// console.log(values);
			const current = templates.filter(
				(item) => item.uid === values.templateUid
			);
			const sendData = {
				type,
				templateName: current.name,
				uid: values.templateUid,
				chartVersion
			};
			getParamsTemp(sendData).then((res) => {
				// console.log(res);
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
						name="templateUid"
						defaultValue={templates && templates[0].uid}
					>
						{templates &&
							templates.map((item) => {
								return (
									<Option key={item.uid} value={item.uid}>
										{item.name}
									</Option>
								);
							})}
					</Select>
				</FormItem>
			</Form>
		</Dialog>
	);
}
