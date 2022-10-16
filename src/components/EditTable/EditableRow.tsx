import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { EditableContext } from './EditableCell';
// export const EditableContext = React.createContext<FormInstance<any> | null>(
// 	null
// );

interface EditableRowProps {
	index: number;
	[propName: string]: any;
}
export default function EditableRow(propsT: EditableRowProps): JSX.Element {
	const { index, ...props } = propsT;
	const [form] = Form.useForm();
	return (
		<Form form={form} component={false}>
			<EditableContext.Provider value={form}>
				<tr {...props} />
			</EditableContext.Provider>
		</Form>
	);
}
