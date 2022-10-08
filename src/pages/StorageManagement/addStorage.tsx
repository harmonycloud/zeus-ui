import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { Button, Space, Form, notification, Input, Select } from 'antd';
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
import { getClusters } from '@/services/common';
import { clusterType } from '@/types';
import pattern from '@/utils/pattern';

const FormItem = Form.Item;
const Option = Select.Option;
export default function AddStorage(): JSX.Element {
	const params: EditStorageParams = useParams();
	const history = useHistory();
	const [form] = Form.useForm();
	const [clusterList, setClusterList] = useState<clusterType[]>([]);
	const [curClusterId, setCurClusterId] = useState<string>();
	const [storages, setStorages] = useState<StorageItem[]>([]);
	const [volumeType, setVolumeType] = useState<string>('');
	useEffect(() => {
		getClusters({ detail: true }).then((res) => {
			if (res.success) {
				setClusterList(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
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
					setVolumeType(res.data.volumeType);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, []);
	useEffect(() => {
		if (curClusterId) {
			getData(curClusterId);
		}
	}, [curClusterId]);
	const getData = (clusterId: string) => {
		const sendData: GetParams = {
			all: true,
			clusterId: clusterId
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
	};
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
		setVolumeType(cur?.volumeType || '');
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
						style={{ width: '60%' }}
					>
						<FormItem
							label="集群"
							required
							name="clusterId"
							rules={[{ required: true, message: '请选择集群' }]}
						>
							<Select
								value={curClusterId}
								onChange={(value: string) => {
									setCurClusterId(value);
									form.setFieldsValue({
										name: '',
										aliasName: '',
										volumeType: '',
										vgName: ''
									});
								}}
								dropdownMatchSelectWidth={false}
								disabled={params.name ? true : false}
							>
								{clusterList.map((item: clusterType) => {
									return (
										<Select.Option
											key={item.id}
											value={item.id}
										>
											{item.nickname}
										</Select.Option>
									);
								})}
							</Select>
						</FormItem>
						<FormItem
							label="StorageClass名称"
							required
							rules={[
								{
									required: true,
									message: '请选择StorageClass名称'
								}
							]}
							name="name"
						>
							<Select
								disabled={params.name ? true : false}
								onChange={handleChange}
								defaultValue={
									storages.length === 0 &&
									'暂不存在未接入的存储'
								}
								dropdownMatchSelectWidth={false}
							>
								{storages.length > 0 &&
									storages.map((item: StorageItem) => {
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
									pattern: new RegExp(pattern.storageName),
									message:
										'存储中文名称由中文、大写字母、小写字母、数字以及“./-”组成，长度不超过32个字符'
								}
							]}
							name="aliasName"
						>
							<Input />
						</FormItem>
						<FormItem label="类型" required name="volumeType">
							<Input disabled />
						</FormItem>
						{volumeType === 'CSI-LVM' && (
							<FormItem
								label="VG名称"
								required
								rules={[
									{
										required: true,
										message: '请填写中文名称'
									}
								]}
								name="vgName"
							>
								<Input disabled />
							</FormItem>
						)}
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
