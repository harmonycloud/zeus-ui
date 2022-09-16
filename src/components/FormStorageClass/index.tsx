import React, { useState, useEffect } from 'react';
import { Form, Select, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getStorageClass } from '@/services/middleware';
import { FormStorageClassProps } from './formStorageClass';
import { StorageClassProps } from '@/types/comment';
import { getLists } from '@/services/storage';
import {
	GetParams,
	StorageItem
} from '@/pages/StorageManagement/storageManage';

const { Item: FormItem } = Form;
const { Option } = Select;

export default function FormStorageClass(
	props: FormStorageClassProps
): JSX.Element {
	const { cluster, namespace } = props;
	const keys = Object.keys(props);
	// const [storageClassList, setStorageClassList] = useState<
	// 	StorageClassProps[]
	// >([]);
	const [storageClassList, setStorageClassList] = useState<StorageItem[]>([]);
	const [value, setValue] = useState<string>(props.defaultValue);
	useEffect(() => {
		if (cluster.id) {
			const sendData: GetParams = {
				all: false,
				clusterId: cluster.id
			};
			getLists(sendData).then((res) => {
				if (res.success) {
					setStorageClassList(res.data);
				}
			});
		}
	}, [cluster]);
	// useEffect(() => {
	// 	getStorageClass({
	// 		clusterId: cluster.id,
	// 		namespace: namespace.name
	// 	}).then((res) => {
	// 		if (res.success) {
	// 			for (let i = 0; i < res.data.length; i++) {
	// 				if (res.data[i].type === 'CSI-LVM') {
	// 					setValue(res.data[i].name);
	// 					break;
	// 				}
	// 			}
	// 			setStorageClassList(res.data);
	// 		}
	// 	});
	// }, [cluster]);

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
					<Select
						style={{ width: '390px' }}
						onChange={handleChange}
						value={value}
						dropdownMatchSelectWidth={false}
					>
						{storageClassList.map((item: StorageItem, index) => (
							<Option
								key={index}
								value={`${item.name}/${item.aliasName}`}
							>
								{item.aliasName}
							</Option>
						))}
					</Select>
				</FormItem>
			</div>
		</div>
	);
}
