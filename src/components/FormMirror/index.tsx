import React, { useState, useEffect } from 'react';
import { Form, AutoComplete, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

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
					<AutoComplete
						style={{ width: '390px' }}
						onChange={handleChange}
						value={value}
						placeholder="请选择"
						allowClear={true}
						dataSource={mirrorList}
					/>
				</FormItem>
			</div>
		</div>
	);
}
