import React from 'react';
import { Dialog, Form, Field, Message } from '@alicloud/console-components';
import RocketACLForm from '@/components/RocketACLForm';
import { updateMiddleware } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { judgeObjArrayAttrIsNull } from '@/utils/utils';
interface aclEditProps {
	visible: boolean;
	onCancel: (value: boolean) => void;
	data: any;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	chartName: string;
	chartVersion: string;
}
interface formProps {
	globalWhiteRemoteAddresses: string;
	rocketMQAccountList: any[];
}
export default function RocketAclEditForm(props: aclEditProps) {
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
		field.validate(
			(errors, values) => {
				if (errors) return;
				// console.log(values);
				const datas: formProps = field.getValues();
				// console.log(datas);
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
				// if (
				// 	judgeObjArrayAttrIsNull(
				// 		datas.rocketMQAccountList,
				// 		'accessKey',
				// 		'secretKey'
				// 	)
				// ) {
				// 	Message.show(
				// 		messageConfig(
				// 			'error',
				// 			'失败',
				// 			'账户密码格式输入错误，长度在7-20个字符'
				// 		)
				// 	);
				// 	return;
				// } else {
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
								Message.show(
									messageConfig('error', '失败', res)
								);
							}
						});
					}
				});
			}
			// }
		);
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
			// height="700px"
			isFullScreen={true}
		>
			<Form field={field}>
				<RocketACLForm field={field} data={data} />
			</Form>
		</Dialog>
	);
}
