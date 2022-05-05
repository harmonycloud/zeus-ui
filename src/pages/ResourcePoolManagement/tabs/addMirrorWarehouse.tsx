import React, { useEffect } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message,
	Select
} from '@alicloud/console-components';
import { addMirror, updateMirror } from '@/services/common';
import messageConfig from '@/components/messageConfig';
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

const AddMirrorWarehouse = (props: AddMirrorWarehouseProps) => {
	const { visible, onCancel, clusterId, onRefresh, data } = props;
	const field = Field.useField();
	const onOk = () => {
		if (!data) {
			field.validate((errors, values) => {
				if (errors) return;
				addMirror({
					clusterId,
					...values
				}).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '镜像仓库创建成功')
						);
						onCancel();
						onRefresh();
					} else {
						Message.show(
							messageConfig('error', '失败', res.errorMsg)
						);
					}
				});
			});
		} else {
			field.validate((errors, values) => {
				if (errors) return;
				updateMirror({
					clusterId,
					...values,
					id: data.id
				}).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '修改成功')
						);
						onCancel();
						onRefresh();
					} else {
						Message.show(
							messageConfig('error', '失败', res.errorMsg)
						);
					}
				});
			});
		}
	};
	useEffect(() => {
		data && field.setValues(data);
	}, [data]);

	return (
		<Dialog
			title={data ? '编辑镜像仓库' : '新增镜像仓库'}
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			onClose={onCancel}
		>
			<Form field={field} {...formItemLayout}>
				<div className="display-form">
					<label className="label">镜像仓库地址</label>
					<FormItem required requiredMessage="请选择">
						<Select name="protocol">
							{address.map((item: any) => {
								return (
									<Option key={item.key} value={item.value}>
										{item.value}
									</Option>
								);
							})}
						</Select>
					</FormItem>
					<FormItem
						required
						style={{ width: '40%' }}
						requiredMessage="请输入主机地址"
						maxLength={32}
						minmaxLengthMessage="主机地址不能超过32位"
					>
						<Input
							id="name"
							name="hostAddress"
							placeholder="请输入harbor主机地址"
						/>
					</FormItem>
					<FormItem
						required
						style={{ width: '20%' }}
						requiredMessage="请输入端口"
						maxLength={16}
						minmaxLengthMessage="端口不能超过16位"
					>
						<Input
							htmlType="number"
							id="name"
							name="port"
							placeholder="端口"
						/>
					</FormItem>
				</div>
				<FormItem
					label="镜像仓库项目"
					required
					requiredMessage="请输入镜像仓库项目"
					maxLength={50}
					minmaxLengthMessage="镜像仓库项目不能超过50位"
				>
					<Input
						id="name"
						name="project"
						placeholder="请输入镜像仓库项目"
					/>
				</FormItem>
				<div className="display-form user">
					<label className="label">镜像仓库鉴权</label>
					<FormItem
						required
						requiredMessage="请输入用户名"
						pattern={pattern.aliasName}
						patternMessage="用户名长度不可超过18字符"
					>
						<Input
							id="name"
							name="username"
							placeholder="请输入用户名"
						/>
					</FormItem>
					<FormItem
						required
						requiredMessage="请输入密码"
						pattern={'^[A-Za-z0-9_.-]{8,16}$'}
						patternMessage={'密码长度为8-16位数字或字母'}
					>
						<Input.Password
							id="name"
							name="password"
							placeholder="请输入密码"
						/>
					</FormItem>
				</div>
				<FormItem label="描述" className="ne-require">
					<Input.TextArea
						id="name"
						name="description"
						maxLength={300}
						placeholder="请输入描述信息，限定300字符串"
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
};
export default AddMirrorWarehouse;
