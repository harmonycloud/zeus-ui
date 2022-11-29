import { Modal, Form, Input, Select, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import { formItemLayout618 } from '@/utils/const';
import { AddDatabaseProps } from '../index.d';
import {
	getCharset,
	getCollation,
	createDatabase,
	updateDatabase
} from '@/services/operatorPanel';
import pattern from '@/utils/pattern';

const { Option } = Select;
export default function AddDatabase(props: AddDatabaseProps): JSX.Element {
	const {
		open,
		onCancel,
		clusterId,
		middlewareName,
		namespace,
		editData,
		onRefresh
	} = props;
	const [form] = Form.useForm();
	const [charsets, setCharsets] = useState<string[]>([]);
	const [currentCharset, setCurrentCharset] = useState<string>('');
	const [collations, setCollations] = useState<string[]>([]);
	useEffect(() => {
		const sendData = {
			clusterId,
			middlewareName,
			namespace
		};
		getCharset(sendData).then((res) => {
			if (res.success) {
				setCharsets(res.data);
			}
		});
	}, []);
	useEffect(() => {
		if (currentCharset) {
			const sendData = {
				clusterId,
				middlewareName,
				namespace,
				charset: currentCharset
			};
			getCollation(sendData).then((res) => {
				if (res.success) {
					setCollations(res.data);
				}
			});
		}
	}, [currentCharset]);
	useEffect(() => {
		if (editData) {
			form.setFieldsValue({ ...editData });
			setCurrentCharset(editData.character);
		}
	}, [editData]);
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				...values,
				clusterId,
				namespace,
				middlewareName
			};
			onCancel();
			if (editData) {
				// * 编辑逻辑
				updateDatabase(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '数据库编辑成功!'
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
				// * 创建逻辑
				createDatabase(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '数据库创建成功!'
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
			}
		});
	};
	return (
		<Modal
			open={open}
			title={editData ? '编辑' : '新增'}
			onCancel={onCancel}
			onOk={onOk}
			width={500}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item
					label="数据库名"
					name="db"
					rules={[
						{
							required: true,
							message: '请输入数据库名称'
						},
						{
							pattern: new RegExp(pattern.dbName),
							message: '请输入1-64个字符'
						}
					]}
				>
					<Input
						disabled={editData ? true : false}
						placeholder="请输入数据库名称"
					/>
				</Form.Item>
				<Form.Item
					label="字符集"
					name="character"
					rules={[
						{
							required: true,
							message: '请选择字符集'
						}
					]}
				>
					<Select
						placeholder="请选择字符集"
						onChange={(value: any) => setCurrentCharset(value)}
						showSearch
						filterOption={(input, option) =>
							(option!.children as unknown as string)
								.toLowerCase()
								.includes(input.toLowerCase())
						}
					>
						{charsets.map((item: string) => (
							<Option key={item} value={item}>
								{item}
							</Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item
					label="校验规则"
					name="collate"
					rules={[
						{
							required: true,
							message: '请选择字符集'
						}
					]}
				>
					<Select
						placeholder="请选择校验规则"
						showSearch
						filterOption={(input, option) =>
							(option!.children as unknown as string)
								.toLowerCase()
								.includes(input.toLowerCase())
						}
					>
						{collations.map((item: string) => (
							<Option key={item} value={item}>
								{item}
							</Option>
						))}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
}
