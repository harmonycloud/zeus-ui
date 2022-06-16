import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import {
	Button,
	Space,
	Form,
	notification,
	Input,
	Select,
	InputNumber
} from 'antd';
import storageIcon from '@/assets/images/storage-manage.svg';
import FormBlock from '@/components/FormBlock';
import { ProHeader, ProPage, ProContent } from '@/components/ProPage';
import { EditStorageParams, StorageItem } from './storageManage';
import { getLists } from '@/services/storage';
import { GetParams } from './storageManage';
import { formItemLayout614 } from '@/utils/const';

const FormItem = Form.Item;
const Option = Select.Option;
export default function AddStorage(): JSX.Element {
	const params: EditStorageParams = useParams();
	const history = useHistory();
	const [form] = Form.useForm();
	const [storages, setStorages] = useState<StorageItem[]>([]);
	useEffect(() => {
		const sendData: GetParams = {
			all: true,
			clusterId: '*'
		};
		getLists(sendData).then((res) => {
			console.log(res);
			if (res.success) {
				setStorages(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	const handleChange = (value: any) => {
		const cur = storages.find((item: StorageItem) => item.name === value);
		form.setFieldsValue({
			clusterId: cur?.clusterId,
			volumeType: cur?.volumeType,
			vgName: cur?.vgName
		});
	};
	return (
		<ProPage>
			<ProHeader
				onBack={() => {
					history.goBack();
				}}
				avatar={{
					children: <img src={storageIcon} />,
					shape: 'square',
					size: 48,
					style: { background: '#F5F5F5' }
				}}
				title={`${params.id ? '编辑' : '新增'}存储管理`}
			/>
			<ProContent>
				<FormBlock title="基础信息">
					<Form
						{...formItemLayout614}
						form={form}
						labelAlign="left"
						style={{ width: '50%' }}
					>
						<FormItem
							label="英文名称"
							required
							rules={[
								{ required: true, message: '请选择英文名称' }
							]}
							name="name"
						>
							<Select onChange={handleChange}>
								{storages.map((item: StorageItem) => {
									return (
										<Option
											key={item.name}
											value={item.name}
										>
											{item.name}
										</Option>
									);
								})}
							</Select>
						</FormItem>
						<FormItem
							label="中文名称"
							required
							rules={[
								{ required: true, message: '请填写中文名称' }
							]}
							name="aliasName"
						>
							<Input />
						</FormItem>
						<FormItem label="集群" required name="clusterId">
							<Input disabled />
						</FormItem>
						<FormItem label="类型" required name="volumeType">
							<Input disabled />
						</FormItem>
						<FormItem
							label="VG名称"
							required
							rules={[
								{ required: true, message: '请填写中文名称' }
							]}
							name="vgName"
						>
							<Input disabled />
						</FormItem>
						<FormItem
							label="配额"
							required
							rules={[
								{ required: true, message: '请填写中文名称' }
							]}
						>
							<InputNumber
								style={{ width: '100%' }}
								addonAfter="GB"
							/>
						</FormItem>
					</Form>
				</FormBlock>
				<Space>
					<Button type="primary">确认</Button>
					<Button
						onClick={() => {
							history.goBack();
						}}
					>
						取消
					</Button>
				</Space>
			</ProContent>
		</ProPage>
	);
}
