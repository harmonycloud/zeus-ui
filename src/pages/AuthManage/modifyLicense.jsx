import React, { useEffect } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message
} from '@alicloud/console-components';
import { putLicense } from '@/services/user';
import messageConfig from '@/components/messageConfig';

const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		span: 4
	},
	wrapperCol: {
		span: 18
	}
};
const formItemParam = {
	labelTextAlign: 'left',
	asterisk: false,
	className: 'ne-required'
};

export default function ModifyLicense(props) {
	const { visible, license, cancelHandle, updateList } = props;
	const field = Field.useField();

	const okHandle = () => {
		field.validate((err, data) => {
			if (!err) {
				putLicense(data).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', 'license修改成功')
						);
						cancelHandle();
						updateList();
					} else {
						Message.show(
							messageConfig(
								'error',
								'错误',
								res.errorMsg || res.errorDetail
							)
						);
					}
				});
			}
		});
	};

	useEffect(() => {
		if (license) {
			field.setValues({ license: license });
		}
	}, [license]);

	return (
		<Dialog
			title="更新授权"
			visible={visible}
			style={{ width: 640 }}
			footerAlign="right"
			onOk={okHandle}
			onCancel={cancelHandle}
			onClose={cancelHandle}
		>
			<Form {...formItemLayout} field={field} style={{ paddingLeft: 20 }}>
				<FormItem
					{...formItemParam}
					label="license"
					required
					requiredMessage="请输入服务商提供的license"
				>
					<Input.TextArea
						name="license"
						rows={4}
						placeholder="请输入服务商提供的license"
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
