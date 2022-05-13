import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Modal, notification } from 'antd';
import { addKv, updateKv } from '@/services/middleware';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const Option = Select.Option;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};
const typeList = ['string', 'hash', 'list', 'zset', 'set'];
export default function KvForm(props: any): JSX.Element {
	const {
		visible,
		onCreate,
		onCancel,
		data,
		clusterId,
		namespace,
		middlewareName,
		db
	} = props;
	const [form] = Form.useForm();
	const [type, setType] = useState('String');

	useEffect(() => {
		if (data) {
			form.setFieldsValue(data);
			setType(data.type);
		}
	}, [data]);
	const onOk: () => void = () => {
		form.validateFields().then((values) => {
			if (data && !data.isAdd) {
				// * 修改数据库
				const sendData: any = {
					clusterId,
					namespace,
					middlewareName,
					db: db[0],
					type: values.type,
					timeOut: values.timeOut,
					key: values.key
				};

				if (values.type === 'list') {
					sendData.list = {
						[String(
							data.lists.findIndex(
								(i: string) => i === data.newValue
							)
						)]: values.newValue
					};
				} else if (values.type === 'hash') {
					sendData[values.type] = {
						[values.newKey]: values.newValue
					};
					sendData.oldHash = {
						[data.newKey]: data.newValue
					};
				} else if (values.type === 'zset') {
					sendData[values.type] = {
						[values.newKey]: values.newValue
					};
					sendData.oldZset = {
						[data.newKey]: data.newValue
					};
				} else if (values.type === 'string') {
					sendData.value = values.newValue;
				} else {
					sendData.set = values.newValue;
					sendData.oldSet = data.newValue;
				}
				updateKv(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '数据库修改成功'
						});
						onCreate();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				// * 创建数据库
				const sendData: any = {
					clusterId,
					namespace,
					middlewareName,
					db: db[0],
					type: values.type,
					timeOut: values.timeOut,
					key: values.key,
					status: data?.isAdd ? 'inside' : 'out'
				};
				if (
					values.type === 'hash' ||
					values.type === 'list' ||
					values.type === 'zset'
				) {
					if (values.type === 'list') {
						if (data) {
							sendData[values.type] = {
								[data.listType]: values.newValue
							};
						} else {
							sendData[values.type] = {
								back: values.newValue
							};
						}
					} else {
						sendData[values.type] = {
							[String(values.newKey)]: values.newValue
						};
					}
				} else if (values.type === 'string') {
					sendData.value = values.newValue;
				} else {
					sendData.set = values.newValue;
				}
				addKv(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '数据库创建成功'
						});
						onCreate();
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

	return (
		<Modal
			title={!data || data?.isAdd ? '新增数据库' : '编辑数据库'}
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			width={540}
		>
			<Form
				form={form}
				{...formItemLayout}
				style={{ paddingLeft: 12 }}
				requiredMark={false}
			>
				<FormItem
					name="key"
					className="ne-required-ingress"
					labelAlign="left"
					// asterisk={false}
					label="键名"
					rules={[
						{
							required: !data,
							message: '请输入键名'
						}
					]}
				>
					<Input
						disabled={data ? true : false}
						placeholder="请输入内容"
					/>
				</FormItem>
				<FormItem
					name="type"
					className="ne-required-ingress"
					labelAlign="left"
					// asterisk={false}
					label="类型"
					rules={[
						{
							required: !data,
							message: '请选择类型'
						}
					]}
				>
					<Select
						disabled={data ? true : false}
						placeholder="请选择"
						style={{ width: '100%' }}
						onChange={(value) => setType(value)}
					>
						{typeList.map((item: string) => {
							return (
								<Option key={item} value={item}>
									{item}
								</Option>
							);
						})}
					</Select>
				</FormItem>
				<FormItem
					name="timeOut"
					labelAlign="left"
					label="超出时间"
					// pattern={'^[0-9]*$'}
					// patternMessage="请输入数字"
				>
					<Input placeholder="请输入内容" />
				</FormItem>
				{type === 'hash' && (
					<FormItem
						name="newKey"
						className="ne-required-ingress"
						labelAlign="left"
						// asterisk={false}
						label="字段"
						// required
						// requiredMessage="请输入字段"
						rules={[
							{
								required: true,
								message: '请输入字段'
							}
						]}
					>
						<Input placeholder="请输入内容" />
					</FormItem>
				)}
				{type === 'zset' && (
					<FormItem
						name="newKey"
						className="ne-required-ingress"
						labelAlign="left"
						// asterisk={false}
						label="分数"
						// required
						// requiredMessage="请输入分数"
						rules={[
							{
								required: true,
								message: '请输入分数'
							}
						]}
					>
						<InputNumber placeholder="请输入内容" />
					</FormItem>
				)}
				<FormItem
					name="newValue"
					className="ne-required-ingress"
					labelAlign="left"
					// asterisk={false}
					label="键值"
					// required
					// requiredMessage="请输入键值"
					rules={[
						{
							required: true,
							message: '请输入内容'
						}
					]}
				>
					<TextArea placeholder="请输入内容" />
				</FormItem>
			</Form>
		</Modal>
	);
}
