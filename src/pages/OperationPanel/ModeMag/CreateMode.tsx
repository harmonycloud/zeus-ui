import { Form, Input, Modal, notification, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { formItemLayout618 } from '@/utils/const';
import pattern from '@/utils/pattern';
import {
	createSchemas,
	getUsers,
	updateSchemas
} from '@/services/operatorPanel';
import { CreateModeProps, PgsqlUserItem } from '../index.d';

const { Option } = Select;
export default function CreateMode(props: CreateModeProps): JSX.Element {
	const {
		open,
		onCancel,
		clusterId,
		namespace,
		middlewareName,
		databaseName,
		onRefresh,
		editData,
		onPgsqlTreeRefresh
	} = props;
	const [form] = Form.useForm();
	const [data, setData] = useState<PgsqlUserItem[]>([]);
	useEffect(() => {
		getUsers({
			clusterId,
			namespace,
			middlewareName,
			type: 'postgresql',
			keyword: ''
		}).then((res) => {
			if (res.success) {
				setData(res.data as PgsqlUserItem[]);
			}
		});
		if (editData) {
			form.setFieldsValue({ ...editData });
		}
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				clusterId,
				namespace,
				middlewareName,
				databaseName,
				...values
			};
			onCancel();
			if (editData) {
				updateSchemas(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '模式修改成功!'
							});
						} else {
							notification.error({
								message: '失败',
								description: (
									<>
										<p>{res.errorMsg}</p>
										<p>{res.errorDetail}</p>
									</>
								)
							});
						}
					})
					.finally(() => {
						onRefresh();
					});
			} else {
				createSchemas(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '模式创建成功!'
							});
							onPgsqlTreeRefresh();
						} else {
							notification.error({
								message: '失败',
								description: (
									<>
										<p>{res.errorMsg}</p>
										<p>{res.errorDetail}</p>
									</>
								)
							});
						}
					})
					.finally(() => {
						onRefresh();
					});
			}
		});
	};
	return (
		<Modal
			title={editData ? '编辑模式' : '创建模式'}
			width={600}
			open={open}
			onCancel={onCancel}
			onOk={onOk}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item
					label="模式名"
					name="schemaName"
					rules={[
						{ required: true, message: '请输入模式名' },
						{
							pattern: new RegExp(pattern.modeName),
							message:
								'模式名存储由中文、大写字母、小写字母、数字以及“_.-”组成，长度不超过64个字符'
						}
					]}
				>
					<Input
						disabled={editData ? true : false}
						placeholder="请输入模式名"
					/>
				</Form.Item>
				<Form.Item label="所有者" name="owner">
					<Select>
						{data.map((item: PgsqlUserItem) => (
							<Option key={item.username} value={item.username}>
								{item.username}
							</Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="备注" name="comment">
					<Input.TextArea rows={3} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
