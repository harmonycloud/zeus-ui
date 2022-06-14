import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import Backup from '@/assets/images/backup.svg';
import { Form, Input, InputNumber, Select, Divider, Button, Tag } from 'antd';
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
	const [selectService, setSelectService] = useState<string>();
	const [selectServices, setSelectServices] = useState<string[]>([]);

	const handleSubmit = () => {
		form.validateFields().then((values) => {
			console.log(values);
		});
	};

	return (
		<ProPage className="add-backup-position">
			<ProHeader
				onBack={() => history.goBack()}
				title="新增备份位置"
				avatar={{
					children: <img src={Backup} />,
					shape: 'square',
					size: 24,
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
									value={selectService}
									style={{ width: '100%', flex: 1 }}
									onChange={(value) => {
										setSelectService(value);
										form.setFieldsValue({
											clusterId: value
										});
									}}
								>
									<Select.Option key="http" value="http">
										http
									</Select.Option>
									<Select.Option key="https" value="https">
										https
									</Select.Option>
								</Select>
								<Button
									icon={<PlusOutlined />}
									style={{ position: 'absolute', right: -48 }}
									disabled={!selectService}
									onClick={() =>
										selectService &&
										!selectServices.find(
											(item) => item === selectService
										) &&
										setSelectServices([
											...selectServices,
											selectService
										])
									}
								></Button>
							</div>
						</Form.Item>
					</div>
					{selectServices?.length ? (
						<div style={{ marginBottom: 24 }} className="tags">
							{selectServices.map((item: string) => {
								return (
									<Tag
										key={item}
										closable
										style={{ padding: '4px 10px' }}
										onClose={() =>
											setSelectServices(
												selectServices.filter(
													(str) => str !== item
												)
											)
										}
									>
										{item}
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
							}
						]}
						name="name"
					>
						<Input placeholder="中文名称" />
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
						<Input placeholder="类型" />
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
							<Select placeholder="http">
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
							<Input placeholder="请输入地址" />
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
							<InputNumber placeholder="请输入端口" />
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
							<Input placeholder="请输入项目名" />
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
				<Button type="primary" style={{ marginRight: 16 }}>
					连接测试
				</Button>
				<Button
					type="primary"
					style={{ marginRight: 16 }}
					onClick={handleSubmit}
				>
					确认
				</Button>
				<Button>取消</Button>
			</ProContent>
		</ProPage>
	);
}
