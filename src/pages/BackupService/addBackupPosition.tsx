import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import Backup from '@/assets/images/backup.svg';
import {
	Form,
	Input,
	InputNumber,
	Select,
	Divider,
	Button,
	Tag,
	notification
} from 'antd';
import { getClusters } from '@/services/common';
import {
	addBackupAddress,
	backupAddressCheck,
	editBackupAddress,
	getBackupAddressDetail
} from '@/services/backup';
import { poolListItem } from '@/types/comment';
import pattern from '@/utils/pattern';

import { PlusOutlined } from '@ant-design/icons';

const formItemLayout = {
	labelCol: {
		span: 2
	},
	wrapperCol: {
		span: 9
	}
};

export default function AddBackupPosition(): JSX.Element {
	const history = useHistory();
	const [form] = Form.useForm();
	const params: { id?: string | undefined } = useParams();
	const [poolList, setPoolList] = useState<poolListItem[]>([]);
	const [selectClusterId, setSelectClusterId] = useState<string>();
	const [selectClusterIds, setSelectClusterIds] = useState<string[]>([]);

	useEffect(() => {
		getClusters().then((res) => {
			if (!res.data) return;
			setPoolList(res.data);
		});
		if (params.id) {
			getBackupAddressDetail({ id: Number(params.id) }).then((res) => {
				if (res.success) {
					setSelectClusterId(res.data.clusterIds[0]);
					setSelectClusterIds(res.data.clusterIds);
					form.setFieldsValue({
						...res.data,
						clusterId: res.data.clusterIds[0],
						http: res.data.endpoint.split(':')[0],
						serverHost: res.data.endpoint
							.split(':')[1]
							.split('//')[1],
						serverPort: res.data.endpoint
							.split(':')[2]
							.split('/')[0],
						bucketName: res.data.endpoint
							.split(':')[2]
							.split('/')[1]
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, []);

	const handleSubmit = (isCheck?: boolean) => {
		form.validateFields().then((values) => {
			if (!selectClusterIds.length) {
				notification.error({
					message: '失败',
					description: '请添加集群'
				});
			} else {
				const sendData = {
					clusterIds: selectClusterIds,
					accessKeyId: values.accessKeyId,
					capacity: values.capacity,
					name: values.name,
					secretAccessKey: values.secretAccessKey,
					type: values.type,
					endpoint:
						values.http +
						'://' +
						values.serverHost +
						':' +
						values.serverPort +
						'/' +
						values.bucketName
				};

				if (isCheck) {
					backupAddressCheck(sendData).then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '测试成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					});
				} else {
					if (params.id) {
						editBackupAddress({
							...sendData,
							id: Number(params.id)
						}).then((res) => {
							if (res.success) {
								notification.success({
									message: '成功',
									description: '修改成功'
								});
								history.goBack();
							} else {
								notification.error({
									message: '失败',
									description: res.errorMsg
								});
							}
						});
					} else {
						addBackupAddress(sendData).then((res) => {
							if (res.success) {
								notification.success({
									message: '成功',
									description: '添加成功'
								});
								history.goBack();
							} else {
								notification.error({
									message: '失败',
									description: res.errorMsg
								});
							}
						});
					}
				}
			}
		});
	};

	return (
		<ProPage className="add-backup-position">
			<ProHeader
				onBack={() => history.goBack()}
				title={params.id ? '编辑备份位置' : '新增备份位置'}
				avatar={{
					children: <img src={Backup} />,
					shape: 'square',
					size: 48,
					style: { background: '#f5f5f5' }
				}}
			/>
			<ProContent>
				<Form form={form} {...formItemLayout} labelAlign="left">
					<h2 style={{ marginBottom: 8 }}>绑定集群</h2>
					<div>
						<Form.Item
							label="集群选择"
							name="clusterId"
							rules={[
								{
									required: true,
									message: '请选择集群'
								}
							]}
						>
							<div style={{ position: 'relative' }}>
								<Select
									placeholder="请选择集群"
									value={selectClusterId}
									style={{ width: '100%', flex: 1 }}
									onChange={(value) => {
										setSelectClusterId(value);
										form.setFieldsValue({
											clusterId: value
										});
									}}
								>
									{poolList.map((item: poolListItem) => {
										return (
											<Select.Option
												value={item.id}
												key={item.id}
											>
												{item.name}
											</Select.Option>
										);
									})}
								</Select>
								<Button
									icon={<PlusOutlined />}
									style={{ position: 'absolute', right: -48 }}
									disabled={!selectClusterId}
									onClick={() =>
										selectClusterId &&
										!selectClusterIds.find(
											(item) => item === selectClusterId
										) &&
										setSelectClusterIds([
											...selectClusterIds,
											selectClusterId
										])
									}
								></Button>
							</div>
						</Form.Item>
					</div>
					{selectClusterIds?.length ? (
						<div style={{ marginBottom: 24 }} className="tags">
							{selectClusterIds.map((item: string) => {
								return (
									<Tag
										key={item}
										closable
										style={{ padding: '4px 10px' }}
										onClose={() =>
											setSelectClusterIds(
												selectClusterIds.filter(
													(str) => str !== item
												)
											)
										}
									>
										{
											poolList.find(
												(res) => res.id === item
											)?.name
										}
									</Tag>
								);
							})}
						</div>
					) : null}
					<h2 style={{ marginBottom: 8 }}>基础信息</h2>
					<Form.Item
						label="中文名称"
						rules={[
							{
								required: true,
								message: '请输入中文名称'
							},
							{
								pattern: new RegExp(pattern.backupAliasName),
								message: '输入不符合要求'
							},
							{
								max: 15,
								type: 'string',
								message: '不能超过15个字'
							}
						]}
						name="name"
					>
						<Input
							placeholder="请输入中文名称"
							disabled={!!params.id}
						/>
					</Form.Item>
					<Form.Item
						label="类型"
						rules={[
							{
								required: true,
								message: '请选择类型'
							}
						]}
						name="type"
					>
						<Select placeholder="请选择类型" disabled={!!params.id}>
							<Select.Option key="S3" value="S3">
								S3
							</Select.Option>
							<Select.Option key="Ftp" value="Ftp" disabled>
								Ftp
							</Select.Option>
							<Select.Option key="服务器" value="服务器" disabled>
								服务器
							</Select.Option>
						</Select>
					</Form.Item>
					<Form.Item label="备份地址" required className="flex-form">
						<Form.Item
							rules={[
								{
									required: true,
									message: '请选择协议'
								}
							]}
							name="http"
						>
							<Select placeholder="协议" disabled={!!params.id}>
								<Select.Option key="http" value="http">
									http
								</Select.Option>
								<Select.Option key="https" value="https">
									https
								</Select.Option>
							</Select>
						</Form.Item>
						<Form.Item
							name="serverHost"
							rules={[
								{
									required: true,
									message: '请输入地址'
								}
							]}
						>
							<Input
								placeholder="请输入地址"
								disabled={!!params.id}
							/>
						</Form.Item>
						<Form.Item
							name="serverPort"
							rules={[
								{
									required: true,
									message: '请输入端口'
								}
							]}
						>
							<InputNumber
								placeholder="请输入端口"
								disabled={!!params.id}
							/>
						</Form.Item>
						<Form.Item
							name="bucketName"
							rules={[
								{
									required: true,
									message: '请输入项目名'
								}
							]}
						>
							<Input
								placeholder="请输入项目名"
								disabled={!!params.id}
							/>
						</Form.Item>
					</Form.Item>
					<Form.Item
						label="用户ID"
						rules={[
							{
								required: true,
								message: '请输入用户ID'
							}
						]}
						name="accessKeyId"
					>
						<Input placeholder="用户ID" />
					</Form.Item>
					<Form.Item
						name="secretAccessKey"
						label="密码"
						rules={[
							{
								required: true,
								message: '请输入密码'
							}
						]}
					>
						<Input placeholder="密码" />
					</Form.Item>
					<Form.Item
						name="capacity"
						label="配额"
						rules={[
							{
								required: true,
								message: '请输入配额'
							}
						]}
					>
						<InputNumber
							placeholder="配额"
							addonAfter="GB"
							style={{ width: 150 }}
						/>
					</Form.Item>
				</Form>
				<Divider />
				<Button
					type="primary"
					style={{ marginRight: 16 }}
					onClick={() => handleSubmit(true)}
				>
					连接测试
				</Button>
				<Button
					type="primary"
					style={{ marginRight: 16 }}
					onClick={() => handleSubmit()}
				>
					确认
				</Button>
				<Button onClick={() => history.goBack()}>取消</Button>
			</ProContent>
		</ProPage>
	);
}
