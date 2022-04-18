import React, { useState } from 'react';
import { Dialog, Icon, Checkbox, Message } from '@alicloud/console-components';
import { uploadLogSwitch } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
interface SwitchFormProps {
	visible: boolean;
	source: string;
	flag: boolean;
	data: {
		clusterId: string;
		namespace: string;
		middlewareName: string;
		chartName: string;
		chartVersion: string;
		type: string;
	};
	onCancel: (v: boolean) => void;
}
export default function SwitchForm(props: SwitchFormProps): JSX.Element {
	const { visible, onCancel, source, flag } = props;
	const {
		clusterId,
		namespace,
		middlewareName,
		chartName,
		chartVersion,
		type
	} = props.data;
	const [checked, setChecked] = useState<boolean>(false);
	const onOk = () => {
		const stdoutEnabled =
			source === 'standard' ? flag : checked ? flag : !flag;
		const filelogEnabled =
			source === 'logfile' ? flag : checked ? flag : !flag;
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			chartName,
			chartVersion,
			type,
			filelogEnabled,
			stdoutEnabled
		};
		onCancel(true);
		uploadLogSwitch(sendData).then((res) => {
			if (res.success) {
				Message.show(
					messageConfig(
						'success',
						'成功',
						`${source === 'standard' ? '标准日志' : '文件日志'}${
							flag ? '开启' : '关闭'
						}成功`
					)
				);
			} else {
				onCancel(false);
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	return (
		<Dialog
			title="   "
			visible={visible}
			onCancel={() => onCancel(false)}
			onClose={() => onCancel(false)}
			onOk={onOk}
		>
			<Icon type="warning" style={{ color: '#0070cc' }} />{' '}
			{`${flag ? '开启' : '关闭'}将导致服务重启${
				flag ? ',数据同步ES也需要等待一会' : ''
			}，是否继续？`}
			<br />
			<br />
			<Checkbox
				style={{ marginLeft: 24 }}
				checked={checked}
				onChange={(checked: boolean) => setChecked(checked)}
				label={`若${source === 'standard' ? '文件日志' : '标准日志'}${
					flag ? '未启用' : '启用中'
				}，您可以选择同步${flag ? '开启' : '关闭'}`}
			/>
		</Dialog>
	);
}
