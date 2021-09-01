import React, { useState, useEffect } from 'react';
import { Form, Select, Balloon, Icon } from '@alicloud/console-components';
import { getSecrets } from '@/services/middleware';
const { Item: FormItem } = Form;
const { Option } = Select;

export default function FormSecret(props) {
	console.log(props);
	const { cluster, namespace } = props;
	const keys = Object.keys(props);
	const [secrets, setSecrets] = useState([]);
	const [value, setValue] = useState(props.defaultValue);

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

	function handleChange(value) {
		console.log(value);
		setValue(value);
	}

	return (
		<div className="display-flex flex-column">
			<label
				className="dynamic-form-name"
				style={keys.includes('required') ? { paddingLeft: 8 } : {}}
			>
				<span
					className={keys.includes('required') ? 'ne-required' : ''}
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
					required={keys.includes('required')}
					requiredMessage={
						keys.includes('required') ? `请选择${props.label}` : ''
					}
					// pattern={pattern.name}
					// patternMessage="请输入由小写字母数字及“-”组成的2-40个字符"
				>
					<Select
						style={{ width: '390px' }}
						onChange={handleChange}
						name={props.variable}
						value={value}
					>
						{secrets.map((item, index) => (
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
