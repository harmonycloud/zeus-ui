import React, { useEffect } from 'react';
import { Modal, Form, Input, Popover, notification, Select } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { createDb, updateDb } from '@/services/middleware';
import pattern from '@/utils/pattern';
import { FormProps } from './database';

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
export default function DataBaseForm(props: FormProps): JSX.Element {
	const {
		visible,
		onCreate,
		onCancel,
		data,
		clusterId,
		namespace,
		middlewareName,
		charsetList
	} = props;
	const [form] = Form.useForm();

	useEffect(() => {
		if (data) {
			form.setFieldsValue(data);
		}
	}, [data]);
	const onOk: () => void = () => {
		form.validateFields().then((values) => {
			if (data) {
				// * 修改数据库
				const sendData = {
					clusterId,
					namespace,
					middlewareName,
					id: data.id,
					db: values.db,
					charset: values.charset,
					description: values.description
				};
				updateDb(sendData).then((res) => {
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
				const sendData = {
					clusterId,
					namespace,
					middlewareName,
					...(values as unknown as any)
				};
				createDb(sendData).then((res) => {
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
			title={!data ? '新增数据库' : '编辑数据库'}
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			width={540}
		>
			<Form form={form} {...formItemLayout} style={{ paddingLeft: 12 }}>
				<FormItem
					name="db"
					// className="ne-required-ingress"
					labelAlign="left"
					// asterisk={false}
					label={
						<div>
							<span style={{ marginRight: 4 }}>数据库名称</span>
							<Popover
								content={
									'由字母、数字、下划线(_)、中划线(-)组成，以小写字母开头，以小写字母或数字结尾，最多64个字符'
								}
							>
								<QuestionCircleOutlined
									style={{ cursor: 'pointer' }}
								/>
							</Popover>
						</div>
					}
					rules={[
						{
							required: !data,
							message: '请输入数据库名称'
						},
						{
							pattern: new RegExp(pattern.databaseName),
							message: '数据库名称不合法'
						}
					]}
				>
					<Input
						disabled={data ? true : false}
						placeholder="请输入内容内容"
					/>
				</FormItem>
				<FormItem
					// className="ne-required-ingress"
					labelAlign="left"
					name="charset"
					// asterisk={false}
					label="支持的字符集"
					rules={[
						{
							required: !data,
							message: '请选择字符集'
						}
					]}
				>
					<Select
						disabled={data ? true : false}
						placeholder="请选择"
						style={{ width: '100%' }}
						dropdownMatchSelectWidth={false}
					>
						{charsetList.map((item: string) => {
							return (
								<Option key={item} value={item}>
									{item}
								</Option>
							);
						})}
					</Select>
				</FormItem>
				<FormItem labelAlign="left" name="description" label="备注">
					<TextArea placeholder="限定200字符串" maxLength={200} />
				</FormItem>
			</Form>
		</Modal>
	);
}
