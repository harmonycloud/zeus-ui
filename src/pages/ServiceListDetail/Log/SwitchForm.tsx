import React, { useState } from 'react';
import { Modal, Checkbox, notification } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { uploadLogSwitch } from '@/services/middleware';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
interface SwitchFormProps {
	visible: boolean;
	source: string;
	flag: boolean;
	withFlag: boolean;
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
	const { visible, onCancel, source, flag, withFlag } = props;
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
			source === 'standard' ? flag : withFlag ? !checked : checked;
		const filelogEnabled =
			source === 'logfile' ? flag : withFlag ? !checked : checked;
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
				notification.success({
					message: '成功',
					description: `${
						source === 'standard' ? '标准日志' : '文件日志'
					}${flag ? '开启' : '关闭'}成功`
				});
			} else {
				onCancel(false);
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	return (
		<Modal visible={visible} onCancel={() => onCancel(false)} onOk={onOk}>
			<ExclamationCircleOutlined
				style={{
					color: '#faad14',
					fontSize: '22px',
					verticalAlign: 'middle'
				}}
			/>{' '}
			{`${flag ? '开启' : '关闭'}将导致服务重启${
				flag ? ',数据同步ES也需要等待一会' : ''
			}，是否继续？`}
			{(flag && !withFlag) || (!flag && withFlag) ? (
				<>
					<br />
					<br />
					<Checkbox
						style={{ marginLeft: 24 }}
						checked={checked}
						onChange={(e: CheckboxChangeEvent) =>
							setChecked(e.target.checked)
						}
					>
						{`是否同步${!withFlag ? '开启' : '关闭'}${
							source === 'standard' ? '文件日志' : '标准日志'
						}`}
					</Checkbox>
				</>
			) : null}
		</Modal>
	);
}
