import React, { useEffect, useState } from 'react';
import { Dialog, Loading } from '@alicloud/console-components';
// import { Controlled as CodeMirror } from 'react-codemirror2';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { getPodNameYaml } from '@/services/middleware';
import 'codemirror/lib/codemirror.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/css/css.js';
import 'codemirror/mode/yaml/yaml.js';
import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter.js';
import 'codemirror/theme/twilight.css';
import 'codemirror/addon/selection/active-line';

interface sendDataProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	podName: string;
}
interface yamlFormProps {
	visible: boolean;
	onCancel: () => void;
	data: sendDataProps;
}
const YamlForm = (props: yamlFormProps) => {
	const { onCancel, visible, data } = props;
	const [value, setValue] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		getPodNameYaml(data).then((res) => {
			if (res.success && res.data !== null) {
				setValue(res.data);
				setLoading(false);
			} else {
				setValue('Something Error!');
				setLoading(false);
			}
		});
	}, [data]);
	return (
		<Dialog
			visible={visible}
			title="查看yaml"
			onCancel={onCancel}
			onOk={onCancel}
			onClose={onCancel}
			style={{ width: '955px' }}
			footer={<></>}
		>
			<Loading visible={loading}>
				<CodeMirror
					className="mid-codemirror"
					value={value}
					options={{
						mode: 'yaml',
						theme: 'twilight',
						lineNumbers: true,
						readOnly: true
					}}
					// onBeforeChange={(editor, data, value) => {
					// 	setValue(value);
					// }}
					// onChange={(editor, data, value) => {
					// 	setValue(value);
					// }}
				/>
			</Loading>
		</Dialog>
	);
};
export default YamlForm;
