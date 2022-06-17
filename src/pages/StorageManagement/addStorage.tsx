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
import {
	AddParams,
	EditStorageParams,
	StorageItem,
	GetParams,
	GetDetailParams
} from './storageManage';
import {
	getLists,
	addStorage,
	getStorageDetail,
	updateStorage
} from '@/services/storage';
import { formItemLayout614 } from '@/utils/const';

const FormItem = Form.Item;
const Option = Select.Option;
export default function AddStorage(): JSX.Element {
	const params: EditStorageParams = useParams();
	const history = useHistory();
	const [form] = Form.useForm();
	const [storages, setStorages] = useState<StorageItem[]>([]);
	// const [curStorage, setCurStorage] = useState<StorageItem>();
	// const [volumeType, setVolumeType] = useState<string>('');
	// const [requestQuota, setRequestQuota] = useState<number>();
	useEffect(() => {
		if (params.name) {
			const sendData: GetDetailParams = {
				clusterId: params.clusterId,
				storageName: params.name
			};
			getStorageDetail(sendData).then((res) => {
				if (res.success) {
					form.setFieldsValue({
						name: params.name,
						aliasName: res.data.aliasName,
						clusterId: params.clusterId,
						volumeType: res.data.volumeType,
						vgName: res.data.vgName
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		} else {
			const sendData: GetParams = {
				all: true,
				clusterId: '*'
			};
			getLists(sendData).then((res) => {
				if (res.success) {
					setStorages(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, []);
	const handleSubmit = () => {
		form.validateFields().then((values) => {
			const sendData: AddParams = {
				name: values.name,
				aliasName: values.aliasName,
				clusterId: values.clusterId,
				vgName: values.vgName,
				volumeType: values.volumeType,
				requestQuota: values.requestQuota,
				storageName: params.name
			};
			if (params.name) {
				updateStorage(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '存储编辑成功'
						});
						history.push('/storageManagement');
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				addStorage(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '存储添加成功'
						});
						history.push('/storageManagement');
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};
	const handleChange = (value: any) => {
		const cur = storages.find((item: StorageItem) => item.name === value);
		form.setFieldsValue({
			clusterId: cur?.clusterId,
			volumeType: cur?.volumeType,
			vgName: cur?.vgName,
			requestQuota: cur?.requestQuota
		});
		// setVolumeType(cur?.volumeType || '');
		// setRequestQuota(cur?.requestQuota);
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
				title={`${params.name ? '编辑' : '新增'}存储管理`}
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
							<Select
								disabled={params.name ? true : false}
								onChange={handleChange}
							>
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
								{ required: true, message: '请填写中文名称' },
								{
									max: 10,
									message: '中文名称长度不超过10个字符'
								}
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
						{/* {volumeType !== 'LocalPath' && (
							<FormItem
								label="配额"
								required
								rules={[
									{
										required: true,
										message: '请填写中文名称'
									}
								]}
								name="requestQuota"
							>
								<InputNumber
									style={{ width: '100%' }}
									addonAfter="GB"
									value={requestQuota}
									onChange={(value: number) => {
										setRequestQuota(value);
									}}
									disabled={requestQuota ? true : false}
								/>
							</FormItem>
						)} */}
					</Form>
				</FormBlock>
				<Space>
					<Button type="primary" onClick={handleSubmit}>
						确认
					</Button>
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
