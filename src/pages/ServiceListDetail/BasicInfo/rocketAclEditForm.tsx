import React from 'react';
import { Dialog, Form, Field, Message } from '@alicloud/console-components';
import RocketACLForm from '@/components/RocketACLForm';
import { updateMiddleware } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { aclEditProps } from '../detail';

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
	const field = Field.useField();
	const onOk = () => {
		field.validate((errors, values) => {
			if (errors) return;
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
			Dialog.show({
				title: '操作确认',
				content: '生效已修改信息需要重启本组件服务，是否继续？',
				onOk: () => {
					updateMiddleware(sendData).then((res) => {
						if (res.success) {
							Message.show(
								messageConfig(
									'success',
									'成功',
									'访问权限控制认证修改成功，3秒后刷新页面'
								)
							);
							onCancel(true);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					});
				}
			});
		});
	};
	return (
		<Dialog
			style={{ width: '1000px' }}
			title="修改访问权限控制认证"
			visible={visible}
			footerAlign="right"
			onOk={onOk}
			onCancel={() => onCancel(false)}
			onClose={() => onCancel(false)}
			shouldUpdatePosition={true}
			isFullScreen={true}
		>
			<Form field={field}>
				<RocketACLForm field={field} data={data} />
			</Form>
		</Dialog>
	);
}
