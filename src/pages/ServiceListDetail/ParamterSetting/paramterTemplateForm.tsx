import React, { useEffect, useState } from 'react';
import {
	Form,
	Dialog,
	Field,
	Select,
	Message
} from '@alicloud/console-components';
import { getParamsTemps, getParamsTemp } from '@/services/template';
import messageConfig from '@/components/messageConfig';
import { ParamterTemplateFormProps, ParamterTemplateItem } from '../detail';

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
export default function ParamterTemplateForm(
	props: ParamterTemplateFormProps
): JSX.Element {
	const { visible, onCreate, onCancel, type, chartVersion } = props;
	const [templates, setTemplates] = useState<ParamterTemplateItem[]>([]);
	const field = Field.useField();

	useEffect(() => {
		getData(type);
	}, [type]);

	const getData = (type: string) => {
		const sendData = {
			type
		};
		getParamsTemps(sendData).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					setTemplates(res.data);
				} else {
					Message.show(messageConfig('error', '失败', '暂无模板'));
				}
			}
		});
	};

	const onOk = () => {
		field.validate((err) => {
			const values: { templateUid: string } = field.getValues();
			if (err) return;
			const current = templates.filter(
				(item) => item.uid === values.templateUid
			);
			const sendData = {
				type,
				templateName: current[0].name,
				uid: values.templateUid,
				chartVersion
			};
			getParamsTemp(sendData).then((res) => {
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
