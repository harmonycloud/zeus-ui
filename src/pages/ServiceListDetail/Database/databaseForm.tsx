import React, { useEffect } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message,
	Icon,
	Balloon
} from '@alicloud/console-components';
import { createDb, updateDb } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { Select } from '@alifd/next';
import { FormProps } from './database';

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
	const field: Field = Field.useField();

	useEffect(() => {
		if (data) {
			field.setValues(data);
		}
	}, [data]);
	const onOk: () => void = () => {
		field.validate((errors, values: any) => {
			if (errors) return;

			if (data) {
				// * 修改数据库
				const sendData = {
					clusterId,
					namespace,
					middlewareName,
					id: values.id,
					charset: values.charset,
					description: values.description
				};
				updateDb(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '数据库修改成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res));
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
						Message.show(
							messageConfig('success', '成功', '数据库创建成功')
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
					required={!data}
					requiredMessage="请输入数据库名称"
					pattern={pattern.databaseName}
					patternMessage="数据库名称不合法"
				>
					<Input
						name="db"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入内容内容"
					/>
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="支持的字符集"
					required={!data}
					requiredMessage="请选择字符集"
				>
					<Select
						name="charset"
						trim={true}
						disabled={data ? true : false}
						placeholder="请选择"
						style={{ width: '100%' }}
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
				<FormItem labelTextAlign="left" asterisk={false} label="备注">
					<TextArea
						name="description"
						trim={true}
						placeholder="限定200字符串"
						maxLength={200}
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
