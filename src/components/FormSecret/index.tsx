import React, { useState, useEffect } from 'react';
import { Form, Select, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { getSecrets } from '@/services/middleware';

import { CustomFormItemProps } from '@/types/comment';

const { Item: FormItem } = Form;
const { Option } = Select;

export default function FormSecret(props: CustomFormItemProps): JSX.Element {
	const { cluster, namespace } = props;
	const keys = Object.keys(props);
	const [secrets, setSecrets] = useState<any>([]);
	const [value, setValue] = useState<any>(props.defaultValue);

	useEffect(() => {
		getSecrets({
			clusterId: cluster.id,
			namespace: namespace.name
		}).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					setValue(res.data[0].name);
				}
				setSecrets(res.data);
			}
		});
	}, [cluster]);

	function handleChange(value: any) {
		setValue(value);
	}

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
				>
					<Select
						style={{ width: '390px' }}
						onChange={handleChange}
						value={value}
						dropdownMatchSelectWidth={false}
					>
						{secrets.map((item: any, index: number) => (
							<Option key={index} value={item.name}>
								{item.name}
							</Option>
						))}
					</Select>
				</FormItem>
			</div>
		</div>
	);
}
