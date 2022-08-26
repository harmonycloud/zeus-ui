import React, { useEffect, useState } from 'react';
import { Modal, Spin } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/yaml/yaml.js';
import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter.js';
import 'codemirror/theme/twilight.css';
import 'codemirror/addon/selection/active-line';
import { getPodYaml } from '@/services/ingress';

interface CheckYamlProps {
	visible: boolean;
	onCancel: () => void;
	data: any;
	clusterId: string;
	ingressName: string;
}
const CheckYaml = (props: CheckYamlProps) => {
	const { onCancel, visible, data, clusterId, ingressName } = props;
	const [value, setValue] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		getPodYaml({
			clusterId: clusterId,
			ingressName: ingressName,
			podName: data.podName
		}).then((res) => {
			if (res.success) {
				setValue(res.data);
				setLoading(false);
			} else {
				setValue('Something Error!');
				setLoading(false);
			}
		});
	}, [data]);
	return (
		<Modal
			visible={visible}
			title="查看yaml"
			onCancel={onCancel}
			onOk={onCancel}
			width={955}
			footer={null}
		>
			<Spin spinning={loading}>
				<CodeMirror
					className="mid-codemirror"
					value={value}
					options={{
						mode: 'yaml',
						theme: 'twilight',
						lineNumbers: true,
						readOnly: true,
						lineWrapping: true
					}}
				/>
			</Spin>
		</Modal>
	);
};
export default CheckYaml;
