import React, { useEffect } from 'react';
import { Dialog, Form, Field, Input } from '@alicloud/console-components';
import { TempProps } from './paramterEdit';
import pattern from '@/utils/pattern';

interface SaveParamTempProp {
	visible: boolean;
	onCancel: () => void;
	onCreate: (value: { name: string; description: string }) => void;
	data: TempProps | undefined;
}
const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 18
	}
};
const FormItem = Form.Item;
const SaveParamTemp = (props: SaveParamTempProp) => {
	const { visible, onCancel, onCreate, data } = props;
	const field = Field.useField();
	useEffect(() => {
		if (data) {
			field.setValues(data);
		}
	}, [data]);
	const onOk = () => {
		field.validate((errors, value) => {
			if (errors) return;
			onCreate(field.getValues());
		});
	};
	return (
		<Dialog
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: '540px' }}
			title="保存为"
		>
			<Form {...formItemLayout} field={field}>
				<FormItem
					label="模板名称"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
					pattern={pattern.roleName}
					patternMessage="模板名称长度不可超过10字符"
					requiredMessage="请输入模板名称"
				>
					<Input
						name="name"
						placeholder="请输入模板名称"
						// maxLength={10}
					/>
				</FormItem>
				<FormItem
					label="模板描述"
					required
					labelTextAlign="left"
					asterisk={false}
					className="ne-required-ingress"
					minmaxLengthMessage="模板描述长度不可超过100字符"
					maxLength={100}
					requiredMessage="请输入模板描述"
				>
					<Input.TextArea
						placeholder="请输入模板描述"
						name="description"
						maxLength={100}
						showLimitHint
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
};
export default SaveParamTemp;
