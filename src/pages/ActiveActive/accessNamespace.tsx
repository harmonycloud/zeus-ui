import React, { useEffect, useState } from 'react';
import {
	Modal,
	Radio,
	RadioChangeEvent,
	Form,
	Select,
	Input,
	notification
} from 'antd';
import { NamespaceResourceProps } from '../ResourcePoolManagement/resource.pool';
import { AccessNamespaceProps } from './activeActive';
import { createNamespace, getNamespaces } from '@/services/common';
import { formItemLayout618 } from '@/utils/const';
type ValidateStatus = Parameters<typeof Form.Item>[0]['validateStatus'];
const FormItem = Form.Item;
export default function AccessNamespace(
	props: AccessNamespaceProps
): JSX.Element {
	const [form] = Form.useForm();
	const { visible, onCancel, clusterId, onCreate, onRefresh } = props;
	const [type, setType] = useState<string>('add');
	const [namespaces, setNamespaces] = useState<NamespaceResourceProps[]>([]);
	const [name, setName] = useState<{
		value: string;
		validateStatus?: ValidateStatus;
		errorMsg?: string | null;
	}>({
		value: '',
		validateStatus: ''
	});
	const [aliasName, setAliasName] = useState<{
		value: string;
		validateStatus?: ValidateStatus;
		errorMsg?: string | null;
	}>({
		value: '',
		validateStatus: ''
	});
	useEffect(() => {
		getNamespaces({
			clusterId: clusterId,
			all: true,
			withQuota: false,
			withMiddleware: false,
			keyword: ''
		}).then((res) => {
			if (res.success) {
				setNamespaces(
					res.data.filter(
						(item: NamespaceResourceProps) =>
							item.availableDomain === false
					)
				);
			}
		});
	}, []);
	const onChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
		if (type === 'name') {
			setName({
				...name,
				value: e.target.value
			});
		} else {
			setAliasName({
				...aliasName,
				value: e.target.value
			});
		}
	};
	const onOk = () => {
		form.validateFields().then((value) => {
			if (type === 'access') {
				onCreate(value);
			} else {
				createNamespace({
					clusterId,
					availableDomain: true,
					...value
				}).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '命名空间创建成功'
						});
						onCancel();
						onRefresh();
					} else {
						setName({
							value: value.name,
							validateStatus: '',
							errorMsg: ''
						});
						setAliasName({
							value: value.name,
							validateStatus: '',
							errorMsg: ''
						});
						res.errorMsg.indexOf('命名空间') !== -1
							? setAliasName({
									value: value.aliasName,
									validateStatus: 'error',
									errorMsg: '提醒：名称重复，请修改'
							  })
							: setName({
									value: value.name,
									validateStatus: 'error',
									errorMsg: '提醒：名称重复，请修改'
							  });
					}
				});
			}
		});
	};
	return (
		<Modal
			visible={visible}
			title="新增/接入"
			onCancel={onCancel}
			onOk={onOk}
		>
			<Radio.Group
				onChange={(e: RadioChangeEvent) => setType(e.target.value)}
				value={type}
				style={{ marginBottom: 24 }}
			>
				<Radio value="add">新增</Radio>
				<Radio value="access">接入</Radio>
			</Radio.Group>
			<Form form={form} {...formItemLayout618} labelAlign="left">
				{type === 'access' && (
					<FormItem
						name="name"
						label="命名空间名称"
						required
						rules={[{ required: true, message: '请选择命名空间' }]}
					>
						<Select dropdownMatchSelectWidth={false}>
							{namespaces.map((item: NamespaceResourceProps) => (
								<Select.Option
									key={item.name}
									value={item.name}
								>
									{item.aliasName}
								</Select.Option>
							))}
						</Select>
					</FormItem>
				)}
				{type === 'add' && (
					<>
						<FormItem
							label="命名空间名称:"
							required
							name="aliasName"
							rules={[
								{ required: true, message: '命名空间名称必填' },
								{
									max: 64,
									type: 'string',
									message:
										'请输入名称，且最大长度不超过64个字符'
								}
							]}
							validateStatus={aliasName.validateStatus}
							help={aliasName.errorMsg}
						>
							<Input value={aliasName.value} />
						</FormItem>
						<FormItem
							label="英文简称:"
							required
							name="name"
							rules={[
								{ required: true, message: '英文简称必填' },
								{
									pattern: new RegExp(
										'^[a-z][a-z0-9-]{0,38}[a-z0-9]$'
									),
									message:
										'命名空间是由小写字母数字及“-”组成，且以小写字母开头和结尾，不能以“-”结尾的2-40个字符'
								}
							]}
							validateStatus={name.validateStatus}
							help={name.errorMsg}
						>
							<Input
								value={name.value}
								onChange={(e) => onChange(e, 'name')}
							/>
						</FormItem>
					</>
				)}
			</Form>
		</Modal>
	);
}
