import React from 'react';
import { Input, Balloon, Icon, Form } from '@alicloud/console-components';

import { formProps } from '../FormInput/form';

const { Item: FormItem } = Form;

/*
	FormPassword：动态表单里的密码组件
*/
export default function FormPassword(props: formProps) {
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
							? `请输入${props.label}`
							: ''
					}
				>
					<Input.Password
						style={{ width: '390px' }}
						defaultValue={props.defaultValue}
						name={props.variable}
						trim
					/>
				</FormItem>
			</div>
		</div>
	);
}
