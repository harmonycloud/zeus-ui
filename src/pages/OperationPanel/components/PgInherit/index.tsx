import React, { useEffect } from 'react';
import { Form, Select } from 'antd';
import { formItemLayout618 } from '@/utils/const';
import { PgInheritProps } from '../../index.d';
export default function PgInherit(props: PgInheritProps): JSX.Element {
	const { data, handleChange } = props;
	const [form] = Form.useForm();
	const onValuesChange = (changedValues: any, allValues: any) => {
		handleChange(allValues);
	};
	useEffect(() => {
		if (data) {
			// form.setFieldsValue({
			// })
		}
	}, [data]);
	return (
		<Form
			style={{ width: '60%' }}
			form={form}
			labelAlign="left"
			{...formItemLayout618}
			onValuesChange={onValuesChange}
		>
			<Form.Item label="模式" name="schemaName">
				<Select options={[]} />
			</Form.Item>
			<Form.Item label="表名（多选）">
				<Select options={[]} mode="multiple" />
			</Form.Item>
		</Form>
	);
}
