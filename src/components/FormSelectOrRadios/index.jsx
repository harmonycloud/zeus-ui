import React, { useState, useEffect } from 'react';
import { Form, Select, Balloon, Icon } from '@alicloud/console-components';
import SelectBlock from '@/pages/ServiceCatalog/components/SelectBlock';
import { renderFormItem } from '@/components/renderFormItem';

const { Item: FormItem } = Form;
const { Option } = Select;

/*
	FormSelectOrRadios： 动态表单中的Select和Radio组件。
	当options的长度大于2时，使用select 否则使用 select
*/
export default function FormSelectOrRadios(props) {
	const keys = Object.keys(props);
	// const [items, setItems] = useState(props);
	const [value, setValue] = useState(props.defaultValue);

	function handleChange(value) {
		// console.log(value);
		props.field.setValues({
			[`${props.variable}`]: value
		});
	}

	useEffect(() => {
		props.field.setValues({
			[`${props.variable}`]: props.defaultValue
		});
	}, []);

	const handleSelectBlock = (value) => {
		setValue(value);
		props.field.setValues({
			[`${props.variable}`]: value
		});
	};

	if (props.options.length > 2) {
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
						<Balloon
							offset={[0, 15]}
							align="t"
							trigger={
								<Icon
									type="question-circle"
									size="xs"
									style={{ marginLeft: 8 }}
								/>
							}
							closable={false}
						>
							{props.description}
						</Balloon>
					) : null}
				</label>
				<div className="form-content">
					<FormItem
						required={keys.includes('required') && props.required}
						requiredMessage={
							keys.includes('required') && props.required
								? `请选择${props.label}`
								: ''
						}
						// pattern={pattern.name}
						// patternMessage="请输入由小写字母数字及“-”组成的2-40个字符"
					>
						<Select
							onChange={handleChange}
							name={props.variable}
							defaultValue={props.defaultValue}
							autoWidth={false}
						>
							{props.options.map((item) => (
								<Option key={item} value={item}>
									{item}
								</Option>
							))}
						</Select>
					</FormItem>
					{props.showSubQuestionIf === value ? (
						<div className="dynamic-second-form-box">
							{props.subQuestions.map((item) => {
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
		const options = props.options.map((item) => {
			return {
				value: item,
				label: item
			};
		});
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
						<Balloon
							offset={[0, 15]}
							align="t"
							trigger={
								<Icon
									type="question-circle"
									size="xs"
									style={{ marginLeft: 8 }}
								/>
							}
							closable={false}
						>
							{props.description}
						</Balloon>
					) : null}
				</label>
				<div className={`form-content`}>
					<div className="display-flex mb-24">
						<SelectBlock
							options={options}
							currentValue={value}
							onCallBack={(value) => handleSelectBlock(value)}
						/>
					</div>
					{props.showSubQuestionIf === value ? (
						<div className="dynamic-second-form-box">
							{props.subQuestions.map((item) => {
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
