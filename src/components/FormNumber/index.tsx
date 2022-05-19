import React from 'react';
import { Input, Form, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { CustomFormItemProps } from '@/types/comment';

const { Item: FormItem } = Form;

export default function FormNumber(props: CustomFormItemProps): JSX.Element {
	const keys = Object.keys(props);

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
						},
						{
							pattern: props.pattern,
							message: props.message
						}
					]}
					name={props.variable}
					initialValue={props.defaultValue}
				>
					<Input
						style={{ width: '390px' }}
						type="number"
						defaultValue={props.defaultValue}
					/>
				</FormItem>
			</div>
		</div>
	);
}
