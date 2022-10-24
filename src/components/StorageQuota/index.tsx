import React, { useEffect, useState } from 'react';
import { Form, Select, InputNumber } from 'antd';
import { getLists } from '@/services/storage';
import {
	GetParams,
	StorageItem
} from '@/pages/StorageManagement/storageManage';
import { StorageQuotaProps } from './storageQuota';
import pattern from '@/utils/pattern';

const FormItem = Form.Item;
export default function StorageQuota(props: StorageQuotaProps): JSX.Element {
	const { clusterId, type, isActiveActive } = props;
	const [storageClassList, setStorageClassList] = useState<StorageItem[]>([]);
	useEffect(() => {
		if (clusterId) {
			const sendData: GetParams = {
				all: false,
				clusterId: clusterId
			};
			getLists(sendData).then((res) => {
				if (res.success) {
					setStorageClassList(res.data);
				}
			});
		}
	}, [clusterId]);
	return (
		<li className="display-flex">
			<label className="form-name">
				<span className="ne-required">存储配额</span>
			</label>
			<div className={`form-content display-flex`}>
				<FormItem
					name={
						type === 'relation'
							? 'relationStorageClass'
							: 'storageClass'
					}
					required
					rules={[
						{
							required: true,
							message: '请选择存储类型'
						}
					]}
				>
					<Select
						placeholder="请选择存储类型"
						style={{
							marginRight: 8,
							width: isActiveActive ? 250 : 150
						}}
						dropdownMatchSelectWidth={false}
						mode={isActiveActive ? 'multiple' : undefined}
					>
						{storageClassList.map((item: StorageItem) => {
							return (
								<Select.Option
									key={item.name}
									value={`${item.name}/${item.aliasName}`}
								>
									{item.aliasName}
								</Select.Option>
							);
						})}
					</Select>
				</FormItem>
				<FormItem
					rules={[
						{
							pattern: new RegExp(pattern.posInt),
							message: '请输入小于21位的正整数'
						},
						{
							required: true,
							message: '请输入存储配额大小（GB）'
						}
					]}
					name={
						type === 'relation'
							? 'relationStorageQuota'
							: 'storageQuota'
					}
					initialValue={5}
					style={{ width: '320px' }}
				>
					<InputNumber
						placeholder="请输入存储配额大小"
						addonAfter="GB"
					/>
				</FormItem>
			</div>
		</li>
	);
}
