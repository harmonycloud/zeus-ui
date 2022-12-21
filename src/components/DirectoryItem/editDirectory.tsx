import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, Form, InputNumber } from 'antd';
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
	storageClassList: StorageItem[];
	inputChange: (value: any) => void;
}

const FormItem = Form.Item;
const EditDirectory = (props: EditDirectoryProps) => {
	const { visible, onCancel, onCreate, data, storageClassList, inputChange } =
		props;
	const [form] = Form.useForm();

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
						},
						{
							validator: (_, name) => {
								const arr = [
									'/bin',
									'/boot',
									'/dev',
									'/etc',
									'/home',
									'/lib',
									'/lib64',
									'/media',
									'/mnt',
									'/proc',
									'/root',
									'/run',
									'/sbin',
									'/scripts',
									'/srv',
									'/sys',
									'/tmp',
									'/usr',
									'/var'
								];
								const res = arr.map((item) => {
									if (
										(name.indexOf(item) === 0 &&
											name.substring(
												item.length,
												name.length
											) === '') ||
										(name.indexOf(item) === 0 &&
											name
												.substring(
													item.length,
													name.length
												)
												.charAt(0) === '/')
									) {
										return false;
									} else {
										return true;
									}
								});
								if (res.some((item) => !item)) {
									return Promise.reject(
										new Error('At least 2 passengers')
									);
								} else {
									return Promise.resolve();
								}
							},
							message: '输入不符合规范'
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
							message: '请选择存储'
						}
					]}
					name="storageClass"
					className="ant-form-name"
					initialValue={data.storageClass}
				>
					<Select
						placeholder="请选择存储"
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
									value={`${item.name}`}
								>
									{item.aliasName}
								</Select.Option>
							);
						})}
					</Select>
				</FormItem>
				<FormItem
					label="磁盘大小"
					labelAlign="left"
					rules={[
						{
							required: true,
							message: '请输入磁盘大小'
						}
					]}
					name="volumeSize"
					className="ant-form-name"
					initialValue={data.volumeSize}
				>
					<InputNumber
						min={0}
						value={data.volumeSize}
						style={{ width: '180px' }}
						onChange={inputChange}
						addonAfter="GB"
						placeholder="请输入磁盘大小"
					/>
				</FormItem>
			</Form>
		</Modal>
	);
};
export default EditDirectory;
