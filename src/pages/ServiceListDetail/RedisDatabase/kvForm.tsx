import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message,
	Icon,
	Balloon
} from '@alicloud/console-components';
import { addKv, updateKv } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { Select } from '@alifd/next';
import { time } from 'console';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const Tooltip = Balloon.Tooltip;
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
	const field: Field = Field.useField();
	const [type, setType] = useState('String');

	useEffect(() => {
		if (data) {
			field.setValues(data);
			setType(data.type);
		}
	}, [data]);
	const onOk: () => void = () => {
		field.validate((errors, values: any) => {
			if (errors) return;

			if (data) {
				// * 修改数据库
				const sendData: any = {
					clusterId,
					namespace,
					middlewareName,
					db: db[0],
					type: values.type,
					timeOut: values.timeOut,
					key: values.key,
					set: values.set
				};
				if (
					values.type === 'hash' ||
					values.type === 'list' ||
					values.type === 'zset'
				) {
					if (values.type === 'list') {
						sendData[values.type] = {
							[data.listType]: values.newValue
						};
					} else {
						sendData[values.type] = {
							[values.newKey]: values.newValue
						};
					}
				} else {
					sendData.value = values.newValue;
				}
				updateKv(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '用户修改成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res));
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
					set: values.set
				};
				if (
					values.type === 'hash' ||
					values.type === 'list' ||
					values.type === 'zset'
				) {
					if (values.type === 'list') {
						sendData[values.type] = {
							back: values.value
						};
					} else {
						sendData[values.type] = {
							[String(values.newKey)]: values.value
						};
					}
				} else {
					sendData.value = values.value;
				}
				addKv(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '用户创建成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};

	return (
		<Dialog
			title={!data ? '新增数据库' : '编辑数据库'}
			visible={visible}
			footerAlign="right"
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			style={{ width: 540 }}
		>
			<Form field={field} {...formItemLayout} style={{ paddingLeft: 12 }}>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="键名"
					required={!data}
					requiredMessage="请输入键名"
				>
					<Input
						name="key"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入内容"
					/>
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="类型"
					required={!data}
					requiredMessage="请选择类型"
				>
					<Select
						name="type"
						trim={true}
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
					labelTextAlign="left"
					label="超出时间"
					requiredMessage="请输入超出时间"
				>
					<Input
						name="timeOut"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入内容"
					/>
				</FormItem>
				{type === 'hash' && (
					<FormItem
						className="ne-required-ingress"
						labelTextAlign="left"
						asterisk={false}
						label="字段"
						required={!data}
						requiredMessage="请输入字段"
					>
						<Input
							name="newKey"
							trim={true}
							placeholder="请输入内容"
						/>
					</FormItem>
				)}
				{type === 'zset' && (
					<FormItem
						className="ne-required-ingress"
						labelTextAlign="left"
						asterisk={false}
						label="分数"
						required={!data}
						requiredMessage="请输入分数"
					>
						<Input
							name="newKey"
							trim={true}
							placeholder="请输入内容"
						/>
					</FormItem>
				)}
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="键值"
					required={type === 'Hash' || type === 'Set'}
				>
					<TextArea
						name={type !== 'set' ? data ? 'newValue' : 'value' : 'set'}
						trim={true}
						placeholder="请输入内容"
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
