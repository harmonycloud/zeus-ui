import React, { useState, useEffect } from 'react';
import { Form, Select, Balloon, Icon } from '@alicloud/console-components';
import { getMirror } from '@/services/common';

const { Item: FormItem } = Form;

export default function FormString(props: any): JSX.Element {
	const { cluster, namespace } = props;
	const keys = Object.keys(props);
	const [mirrorList, setMirrorList] = useState<string[]>([]);

	const [value, setValue] = useState<string>(props.defaultValue);

	useEffect(() => {
		getMirror({
			clusterId: cluster.id
		}).then((res) => {
			if (res.success) {
				setMirrorList(res.data.list.map((item: any) => item.address));
			}
		});
	}, [cluster]);

	function handleChange(value: any): void {
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
				>
					<Select.AutoComplete
						style={{ width: '390px' }}
						onChange={handleChange}
						name={props.variable}
						value={value}
						autoWidth={false}
						placeholder="请选择"
						hasClear={true}
						dataSource={mirrorList}
					/>
				</FormItem>
			</div>
		</div>
	);
}
