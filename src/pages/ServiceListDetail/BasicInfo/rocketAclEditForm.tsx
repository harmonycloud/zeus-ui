import React from 'react';
import { Modal, Form, notification } from 'antd';
import RocketACLForm from '@/components/RocketACLForm';
import { updateMiddleware } from '@/services/middleware';
import { aclEditProps } from '../detail';

const { confirm } = Modal;
export default function RocketAclEditForm(props: aclEditProps): JSX.Element {
	const {
		visible,
		onCancel,
		data,
		clusterId,
		namespace,
		middlewareName,
		chartName,
		chartVersion
	} = props;
	const [form] = Form.useForm();
	// const field = Field.useField();
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				clusterId,
				namespace,
				middlewareName,
				chartName,
				chartVersion,
				type: chartName,
				rocketMQParam: {
					acl: {
						enable: true,
						...values
					}
				}
			};
			confirm({
				title: '操作确认',
				content: '生效已修改信息需要重启本组件服务，是否继续？',
				onOk: () => {
					updateMiddleware(sendData).then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description:
									'访问权限控制认证修改成功，3秒后刷新页面'
							});
							onCancel(true);
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					});
				}
			});
		});
	};
	return (
		<Modal
			width={1000}
			title="修改访问权限控制认证"
			visible={visible}
			// footerAlign="right"
			onOk={onOk}
			onCancel={() => onCancel(false)}
		>
			<Form form={form}>
				<RocketACLForm form={form} data={data} />
			</Form>
		</Modal>
	);
}
