import React, { useEffect, useState } from 'react';
import { Select, Form, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import SelectBlock from '../SelectBlock';
import { renderFormItem } from '@/components/renderFormItem';
import { FormSelectOrRadiosProps } from './formSelectOrRadios';

const { Item: FormItem } = Form;
const { Option } = Select;

/*
	FormSelectOrRadios： 动态表单中的Select和Radio组件。
	当options的长度大于2时，使用select 否则使用 select
*/
export default function FormSelectOrRadios(
	props: FormSelectOrRadiosProps
): JSX.Element {
	const keys = Object.keys(props);
	const [value, setValue] = useState<string>(props.defaultValue);
	useEffect(() => {
		const filedValue = props.form.getFieldsValue();
		const keys = Object.keys(filedValue);
		if (props.defaultValue !== '' && !keys.includes(props.variable)) {
			props.form.setFieldsValue({
				[`${props.variable}`]: props.defaultValue
			});
		}
	}, []);
	const handleChange: (value: any) => void = (value) => {
		props.form.setFieldsValue({
			[`${props.variable}`]: value
		});
	};
	const handleSelectBlock: (value: any) => void = (value: any) => {
		setValue(value);
		props.form.setFieldsValue({
			[`${props.variable}`]: value
		});
	};

	if (props.options && props.options.length > 2) {
		return (
			<div className="display-flex flex-column">
				<label
					className="dynamic-form-name"
					style={
						keys.includes('required') && props.required
							? { paddingLeft: 8 }
							: {}
					}
				>
					<span
						className={
							keys.includes('required') && props.required
								? 'ne-required'
								: ''
						}
					>
						{props.label}
					</span>
					{keys.includes('description') ? (
						<Popover
							// offset={[0, 15]}
							content={props.description}
						>
							<QuestionCircleOutlined style={{ marginLeft: 8 }} />
						</Popover>
					) : null}
				</label>
				<div className="form-content">
					<FormItem
						rules={[
							{
								required:
									keys.includes('required') && props.required,
								message:
									keys.includes('required') && props.required
										? `请输入${props.label}`
										: ''
							}
						]}
						name={props.variable}
						initialValue={props.defaultValue}
					>
						<Select onChange={handleChange}>
							{props.options?.map((item) => (
								<Option key={item} value={item}>
									{item}
								</Option>
							))}
						</Select>
					</FormItem>
					{props.showSubQuestionIf === value ? (
						<div className="dynamic-second-form-box">
							{props.subQuestions?.map((item) => {
								return (
									<React.Fragment key={item.variable}>
										{renderFormItem(item)}
									</React.Fragment>
								);
							})}
						</div>
					) : null}
				</div>
			</div>
		);
	} else {
		const options =
			props.options?.map((item) => {
				return {
					value: item,
					label: item
				};
			}) || [];
		return (
			<div className="display-flex flex-column">
				<label
					className="dynamic-form-name"
					style={
						keys.includes('required') && props.required
							? { paddingLeft: 8 }
							: {}
					}
				>
					<span
						className={
							keys.includes('required') && props.required
								? 'ne-required'
								: ''
						}
					>
						{props.label}
					</span>
					{keys.includes('description') ? (
						<Popover
							// offset={[0, 15]}
							content={props.description}
						>
							<QuestionCircleOutlined style={{ marginLeft: 8 }} />
						</Popover>
					) : null}
				</label>
				<div className={`form-content`}>
					<div className="display-flex mb-24">
						<FormItem
							name="version"
							initialValue={props.defaultValue}
						>
							<SelectBlock
								options={options}
								currentValue={value}
								onCallBack={(value: any) =>
									handleSelectBlock(value)
								}
							/>
						</FormItem>
					</div>
					{props.showSubQuestionIf === value ? (
						<div className="dynamic-second-form-box">
							{props.subQuestions?.map((item) => {
								return (
									<React.Fragment key={item.variable}>
										{renderFormItem(item)}
									</React.Fragment>
								);
							})}
						</div>
					) : null}
				</div>
			</div>
		);
	}
}
