import React, { useContext, useEffect, useRef, useState } from 'react';
import { Checkbox, Form, Input, InputNumber, InputRef, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { DefaultOptionType } from 'antd/lib/select';
// import EditableContext from './EditableRow';
export const EditableContext = React.createContext<FormInstance<any> | null>(
	null
);

interface EditableCellProps {
	title: React.ReactNode;
	editable: boolean;
	children: React.ReactNode;
	dataIndex: any;
	record: any;
	colType: string;
	checked: boolean;
	disabled?: boolean;
	handleSave: (record: any) => void;
	options: DefaultOptionType[];
}
export const EditableCell: React.FC<EditableCellProps> = ({
	title,
	editable,
	children,
	dataIndex,
	record,
	colType,
	checked,
	handleSave,
	options,
	...restProps
}) => {
	const inputRef = useRef<InputRef>(null);
	const form = useContext(EditableContext)!;
	useEffect(() => {
		if (checked) {
			form.setFieldsValue({ [dataIndex]: record[dataIndex] });
			// TODO 第一个光标focus
			// inputRef.current!.focus();
		}
	}, [checked]);

	const save = async () => {
		try {
			const values = await form.validateFields();
			handleSave({ ...record, ...values });
		} catch (errInfo) {
			console.log('Save failed:', errInfo);
		}
	};
	const handleCheckboxChange = (
		e: CheckboxChangeEvent,
		dataIndexTemp: string
	) => {
		form.setFieldValue(dataIndexTemp, e.target.checked);
		save();
	};
	const handleSelectChange = (value: any, dataIndexTemp: string) => {
		form.setFieldValue(dataIndexTemp, value);
		save();
	};
	const handleInputNumber = (value: any, dataIndexTemp: string) => {
		form.setFieldValue(dataIndexTemp, value);
		save();
	};
	let childNode = children;
	const childNodeRender = () => {
		switch (colType) {
			case 'string':
				return (
					<Form.Item style={{ margin: 0 }} name={dataIndex}>
						<Input
							ref={inputRef}
							onPressEnter={save}
							onBlur={save}
							disabled={record.disabled}
						/>
					</Form.Item>
				);
			case 'checkbox':
				return (
					<Form.Item style={{ margin: 0 }} name={dataIndex}>
						<Checkbox
							onChange={(e: CheckboxChangeEvent) =>
								handleCheckboxChange(e, dataIndex)
							}
							defaultChecked={record[dataIndex]}
							disabled={record.disabled}
						/>
					</Form.Item>
				);
			case 'select':
				return (
					<Form.Item style={{ margin: 0 }} name={dataIndex}>
						<Select
							onChange={(value: any) =>
								handleSelectChange(value, dataIndex)
							}
							options={options}
							disabled={record.disabled}
						/>
					</Form.Item>
				);
			case 'mulSelect':
				return (
					<Form.Item style={{ margin: 0 }} name={dataIndex}>
						<Select
							onChange={(value: any) =>
								handleSelectChange(value, dataIndex)
							}
							mode="multiple"
							options={options}
							disabled={record.disabled}
						/>
					</Form.Item>
				);
			case 'number':
				return (
					<Form.Item style={{ margin: 0 }} name={dataIndex}>
						<InputNumber
							onChange={(value: any) =>
								handleInputNumber(value, dataIndex)
							}
							disabled={record.disabled}
						/>
					</Form.Item>
				);
			default:
				return (
					<div
						className="editable-cell-value-wrap"
						// style={{ paddingRight: 24 }}
					>
						{children}
					</div>
				);
		}
	};
	const unCheckedChildNodeRender = () => {
		switch (colType) {
			case 'checkbox':
				return (
					<Form.Item style={{ margin: 0 }} name={dataIndex}>
						<Checkbox
							onChange={(e: CheckboxChangeEvent) =>
								handleCheckboxChange(e, dataIndex)
							}
							checked={record[dataIndex]}
							disabled={record.disabled}
						/>
					</Form.Item>
				);
			default:
				return (
					<div className="editable-cell-value-wrap">{children}</div>
				);
		}
	};
	if (editable) {
		childNode = checked ? childNodeRender() : unCheckedChildNodeRender();
	}

	return <td {...restProps}>{childNode}</td>;
};
