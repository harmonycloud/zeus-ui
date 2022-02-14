import React, { useState } from 'react';
import { Form, Switch, Balloon, Icon } from '@alicloud/console-components';
import { renderFormItem } from '@/components/renderFormItem';
import { FormSwitchProps } from './formSwitch';

const { Item: FormItem } = Form;

/*
	FormSwitch: 动态表达中的switch 组件
*/
export default function FormSwitch(props: FormSwitchProps): JSX.Element {
	const keys = Object.keys(props);
	const [currentValue, setCurrentValue] = useState(
		JSON.parse(props.defaultValue)
	);

	const onChange = (checked: boolean) => {
		setCurrentValue(checked);
	};

	return (
		<div className="display-flex  flex-column">
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
					<label className="dynamic-switch-label">
						{currentValue ? '已开启' : '已关闭 '}
					</label>
					<Switch
						checked={currentValue}
						name={props.variable}
						onChange={onChange}
						size="small"
						style={{
							marginLeft: 24,
							verticalAlign: 'middle'
						}}
					/>
				</FormItem>
				{(props.showSubQuestionIf &&
					JSON.parse(props.showSubQuestionIf)) === currentValue ? (
					<div className="dynamic-second-form-box">
						{props.subQuestions?.map((item) => {
							return (
								<React.Fragment key={item.variable}>
									{renderFormItem(
										item,
										{},
										props.cluster,
										props.namespace
									)}
								</React.Fragment>
							);
						})}
					</div>
				) : null}
			</div>
		</div>
	);
}
