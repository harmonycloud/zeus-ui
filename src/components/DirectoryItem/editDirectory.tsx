import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, Form } from 'antd';
import { getLists } from '@/services/storage';
import {
	GetParams,
	StorageItem
} from '@/pages/StorageManagement/storageManage';
import { modeItemProps } from './index';

interface EditDirectoryProps extends modeItemProps {
	visible: boolean;
	onCreate: (value: any) => void;
	onCancel: () => void;
	inputChange: (value: any) => void;
}

const FormItem = Form.Item;
const EditDirectory = (props: EditDirectoryProps) => {
	const { visible, onCancel, onCreate, data, clusterId, inputChange } = props;
	const [storageClassList, setStorageClassList] = useState<StorageItem[]>([]);
	const [form] = Form.useForm();

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

	const onOk = () => {
		form.validateFields().then((values) => {
			const value = { ...data, ...values };
			onCreate(value);
		});
	};

	return (
		<Modal
			title="实例配置"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			width={500}
			centered
		>
			<Form form={form}>
				<FormItem
					label="宿主机目录"
					labelAlign="left"
					rules={[
						{
							required: true,
							message: '请输入宿主机目录'
						}
					]}
					name="hostPath"
					className="ant-form-name"
					initialValue={data.hostPath}
				>
					<Input
						value={data.hostPath}
						style={{ width: '100%' }}
						onChange={inputChange}
						placeholder="请输入/开头的目录地址"
					/>
				</FormItem>
				<FormItem
					label="容器内目录"
					labelAlign="left"
					rules={[
						{
							required: true,
							message: '请输入宿主机目录'
						}
					]}
					name="mountPath"
					className="ant-form-name"
					initialValue={data.mountPath}
				>
					<Input
						value={data.mountPath}
						style={{ width: '100%' }}
						onChange={inputChange}
						placeholder="请输入/开头的目录地址"
					/>
				</FormItem>
				<FormItem
					label="存储"
					labelAlign="left"
					rules={[
						{
							required: true,
							message: '请选择存储类型'
						}
					]}
					name="storageClass"
					className="ant-form-name"
					initialValue={data.storageClass}
				>
					<Select
						placeholder="请选择存储类型"
						style={{
							marginRight: 8,
							width: '100%'
						}}
						dropdownMatchSelectWidth={false}
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
			</Form>
		</Modal>
	);
};
export default EditDirectory;
