import React, { useEffect } from 'react';
import {
	Modal,
	Form,
	Select,
	Input,
	notification,
	Space,
	Row,
	Col,
	InputNumber
} from 'antd';
import { addMirror, updateMirror } from '@/services/common';
import { address } from '@/utils/const';
import { AddMirrorWarehouseProps } from '../resource.pool';
import pattern from '@/utils/pattern';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};
const formItemLayout2 = {
	labelCol: {
		span: 0
	},
	wrapperCol: {
		span: 24
	}
};

const AddMirrorWarehouse = (props: AddMirrorWarehouseProps) => {
	const { visible, onCancel, clusterId, onRefresh, data } = props;
	const [form] = Form.useForm();
	const onOk = () => {
		if (!data) {
			form.validateFields().then((values) => {
				addMirror({
					clusterId,
					...values
				}).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '镜像仓库创建成功'
						});
						onCancel();
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			});
		} else {
			form.validateFields().then((values) => {
				updateMirror({
					clusterId,
					...values,
					id: data.id
				}).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '镜像仓库修改成功'
						});
						onCancel();
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			});
		}
	};
	useEffect(() => {
		data && form.setFieldsValue(data);
	}, [data]);

	return (
		<Modal
			title={data ? '编辑镜像仓库' : '新增镜像仓库'}
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			okText="确定"
			cancelText="取消"
		>
			<Form labelAlign="left" form={form} {...formItemLayout}>
				<div className="display-form">
					<label className="label">镜像仓库地址</label>
					<Row>
						<Col span={8} style={{ marginRight: 7 }}>
							<FormItem
								{...formItemLayout2}
								name="protocol"
								required
								rules={[{ required: true, message: '请选择' }]}
							>
								<Select
									placeholder="请选择镜像地址"
									style={{ width: '120px' }}
								>
									{address.map((item: any) => {
										return (
											<Option
												key={item.key}
												value={item.value}
											>
												{item.value}
											</Option>
										);
									})}
								</Select>
							</FormItem>
						</Col>
						<Col span={9} style={{ marginRight: 6 }}>
							<FormItem
								{...formItemLayout2}
								required
								name="hostAddress"
								rules={[
									{
										required: true,
										message: '请输入主机地址'
									},
									{ max: 32, message: '主机地址不能超过32位' }
								]}
							>
								<Input placeholder="请输入harbor主机地址" />
							</FormItem>
						</Col>
						<Col span={6}>
							<FormItem {...formItemLayout2} name="port">
								<InputNumber placeholder="端口" />
							</FormItem>
						</Col>
					</Row>
				</div>
				<FormItem
					label="镜像仓库项目"
					required
					rules={[
						{ required: true, message: '请输入镜像仓库项目' },
						{ max: 50, message: '镜像仓库项目不能超过50位' }
					]}
					name="project"
				>
					<Input placeholder="请输入镜像仓库项目" />
				</FormItem>
				<div className="display-form user">
					<label className="label">镜像仓库鉴权</label>
					<FormItem
						{...formItemLayout2}
						required
						rules={[
							{ required: true, message: '请输入用户名' },
							{
								pattern: new RegExp(pattern.aliasName),
								message: '用户名长度不可超过18字符'
							}
						]}
						style={{ width: '36%', marginRight: 8 }}
						name="username"
					>
						<Input placeholder="请输入用户名" />
					</FormItem>
					<FormItem
						{...formItemLayout2}
						required
						name="password"
						rules={[
							{ required: true, message: '请输入密码' },
							{ max: 64, min: 8, message: '密码长度为8-64' }
						]}
						style={{ width: '37%' }}
					>
						<Input.Password placeholder="请输入密码" />
					</FormItem>
				</div>
				<FormItem label="描述" name="description">
					<Input.TextArea
						maxLength={300}
						placeholder="请输入描述信息，限定300字符串"
					/>
				</FormItem>
			</Form>
		</Modal>
	);
};
export default AddMirrorWarehouse;
