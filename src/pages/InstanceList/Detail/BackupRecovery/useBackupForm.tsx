import React from 'react';
import {
	Dialog,
	Form,
	Field,
	Message,
	Input
} from '@alicloud/console-components';
import { applyBackup } from '@/services/backup';
import messageConfig from '@/components/messageConfig';

const FormItem = Form.Item;
interface useBackupProps {
	visible: boolean;
	onCancel: () => void;
	backupFileName: string;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
}
interface valuesProps {
	name: string;
	aliasName: string;
}
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};
export default function UseBackupForm(props: useBackupProps): JSX.Element {
	const {
		visible,
		onCancel,
		backupFileName,
		clusterId,
		namespace,
		middlewareName,
		type
	} = props;
	const field = Field.useField();
	const onCreate = () => {
		field.validate((errors) => {
			if (errors) return;
			const values: valuesProps = field.getValues();
			const sendData = {
				backupName: backupFileName,
				restoreName: values.name,
				aliasName: values.aliasName,
				clusterId,
				namespace,
				middlewareName,
				type
			};
			console.log(sendData);
			applyBackup(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '实例创建成功')
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				})
				.finally(() => {
					onCancel();
				});
		});
	};
	return (
		<Dialog
			title={
				<div>
					备份服务创建
					<div style={{ fontSize: 12, marginTop: '4px' }}>
						新创建的服务将复用旧服务参数配置，并使用已选择的备份数据
					</div>
				</div>
			}
			onClose={onCancel}
			visible={visible}
			onCancel={onCancel}
			onOk={onCreate}
			style={{ width: '500px' }}
		>
			<div className="use-backup-form-title">
				<div className="blue-line"></div>
				<div>完善服务基本信息</div>
			</div>
			<Form {...formItemLayout} field={field} style={{ paddingLeft: 12 }}>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="服务名称"
					required
					requiredMessage="请输入服务名称"
				>
					<Input name="name" />
				</FormItem>
				<FormItem
					labelTextAlign="left"
					asterisk={false}
					label="中文别名"
				>
					<Input name="aliasName" />
				</FormItem>
			</Form>
		</Dialog>
	);
}
