import {
	createPgDatabase,
	getEncoding,
	getUsers,
	updatePgDatabase
} from '@/services/operatorPanel';
import { formItemLayout618 } from '@/utils/const';
import { Modal, Form, Input, Select, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { AddPgDatabaseProps, PgsqlUserItem } from '../index.d';

const tableSpaceOptions = [
	{ label: 'pg_default', value: 'pg_default' },
	{ label: 'pg_global', value: 'pg_global' }
];
const { Option } = Select;
export default function AddPgDatabase(props: AddPgDatabaseProps): JSX.Element {
	const {
		open,
		onCancel,
		clusterId,
		namespace,
		middlewareName,
		editData,
		onRefresh
	} = props;
	const [form] = Form.useForm();
	const [data, setData] = useState<PgsqlUserItem[]>([]);
	const [encoding, setEncoding] = useState<string[]>([]);
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
		getEncoding({ clusterId, namespace, middlewareName }).then((res) => {
			if (res.success) {
				setEncoding(res.data);
			}
		});
		if (editData) {
			form.setFieldsValue({ ...editData });
		}
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			if (editData) {
				updatePgDatabase({
					clusterId,
					namespace,
					middlewareName,
					...values
				})
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '数据库修改成功!'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						onRefresh();
					});
			} else {
				createPgDatabase({
					clusterId,
					namespace,
					middlewareName,
					...values
				})
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '数据库创建成功!'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
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
			open={open}
			title="新增"
			onCancel={onCancel}
			onOk={onOk}
			width={500}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item required label="数据库名" name="databaseName">
					<Input
						disabled={editData ? true : false}
						placeholder="请输入数据库名称"
					/>
				</Form.Item>
				<Form.Item required label="字符集" name="encoding">
					<Select placeholder="请选择字符集">
						{encoding.map((item: string) => (
							<Option key={item} value={item}>
								{item}
							</Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item required label="表空间" name="tablespace">
					<Select
						options={tableSpaceOptions}
						placeholder="请选择表空间"
					/>
				</Form.Item>
				<Form.Item required label="所有者" name="owner">
					<Select placeholder="请选择所有者">
						{data.map((item: PgsqlUserItem) => (
							<Option key={item.username} value={item.username}>
								{item.username}
							</Option>
						))}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
}
