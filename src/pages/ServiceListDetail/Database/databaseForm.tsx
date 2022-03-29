import React, { useEffect, useState, useRef } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message,
	Icon,
	Balloon
} from '@alicloud/console-components';
import { createUser, updateUser } from '@/services/user';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { Select } from '@alifd/next';

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
interface userFormProps {
	visible: boolean;
	onCreate: () => void;
	onCancel: () => void;
	data: any | undefined | null;
}
export default function DataBaseForm(props: userFormProps): JSX.Element {
	const { visible, onCreate, onCancel, data } = props;
	const field: Field = Field.useField();

	useEffect(() => {
		console.log(111);
	}, []);
	const onOk: () => void = () => {
		field.validate((errors, values) => {
			if (errors) return;
			const sendData = {
				...(values as unknown as any)
			};
			if (data) {
				// * 修改用户
				updateUser(sendData).then((res) => {
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
				// * 创建用户
				createUser(sendData).then((res) => {
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
			title={!data ? '新增用户' : '编辑用户'}
			visible={visible}
			footerAlign="right"
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
            style={{width: 540}}
		>
			<Form field={field} {...formItemLayout} style={{ paddingLeft: 12 }}>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label={
						<div>
							<span style={{ marginRight: 4 }}>数据库名称</span>
							<Tooltip
								trigger={
									<Icon
										type="question-circle"
										size="xs"
										style={{ cursor: 'pointer' }}
									/>
								}
							>
								由字母、数字、下划线(_)、中划线(-)组成，以小写字母开头，以小写字母或数字结尾，最多64个字符
							</Tooltip>
						</div>
					}
					required
					requiredMessage="请输入数据库名称"
					pattern={pattern.databaseName}
					patternMessage="数据库名称不合法"
				>
					<Input
						name="userName"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入"
					/>
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="支持的字符集"
					required
					requiredMessage="请选择字符集"
				>
					<Select
						name="password"
						trim={true}
						disabled={data ? true : false}
						placeholder="请选择"
                        style={{width: '100%'}}
					>
						<Option key="utf-8" value="utf-8">
							utf-8
						</Option>
					</Select>
				</FormItem>
				<FormItem labelTextAlign="left" asterisk={false} label="备注">
					<TextArea
						name="email"
						trim={true}
						placeholder="限定200字符串"
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
