import React, { useEffect, useRef, useState } from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { Button, notification, Modal, Alert } from 'antd';
import { useParams, useHistory } from 'react-router';
import { getValueYaml, updateValueYaml } from '@/services/middleware';
import CodeMirror from 'codemirror';
import 'codemirror/addon/merge/merge.css';
import 'codemirror/addon/merge/merge.js';
import 'codemirror/mode/yaml/yaml.js';
import 'codemirror/mode/yaml-frontmatter/yaml-frontmatter.js';
import 'codemirror/theme/twilight.css';
import 'codemirror/addon/selection/active-line';
import { verificationYaml } from '@/services/configmap';
import yaml from 'js-yaml';

const msgColor = {
	1: '#f9a144',
	2: '#EF595C',
	3: '#68B642'
};
interface paramsProps {
	middlewareName: string;
	clusterId: string;
	namespace: string;
	type: string;
	chartVersion: string;
	name: string;
	aliasName: string;
}
interface YamlMsgProp {
	time: string;
	msg: string;
	messageStatus: number;
}
const { confirm } = Modal;
const YamlEdit = () => {
	const codeEditor = useRef<any>(null);
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		chartVersion,
		name,
		aliasName
	}: paramsProps = useParams();
	const [oldValue, setOldValue] = useState<string>('');
	const [newValue, setNewValue] = useState<string>('');
	const [originValue, setOriginValue] = useState('');
	const [codeMirrorInstance, setCodeMirrorInstance] = useState<any>();
	const [yamlMsg, setYamlMsg] = useState<YamlMsgProp[]>([]);
	const [saveFlag, setSaveFlag] = useState<boolean>(true);
	const [returnFlag, setReturnFlag] = useState<boolean>(true);
	const history = useHistory();
	const timeoutId = useRef(0);
	useEffect(() => {
		if (!originValue) return;
		const parseYaml = () => {
			try {
				yaml.loadAll(originValue);
				const msgTemp = 'YAML: Format check successful';
				addYamlMsg(msgTemp, 1);
			} catch (err: any) {
				const msgTemp = `${err.name}: ${err.message}`;
				addYamlMsg(msgTemp, 2);
			}
		};
		timeoutId.current = setTimeout(parseYaml, 500) as unknown as number;
		return () => {
			clearTimeout(timeoutId.current);
		};
	}, [originValue]);
	useEffect(() => {
		getValueYaml({
			clusterId,
			namespace,
			middlewareName
		}).then((res) => {
			if (res.success) {
				setOldValue(res.data);
				setNewValue(res.data);
				setOriginValue(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	useEffect(() => {
		init();
	}, [newValue]);

	const init = () => {
		codeEditor.current.innerHTML = '';
		const CodeMirrorInstance = CodeMirror.MergeView(
			codeEditor?.current as HTMLElement,
			{
				theme: 'twilight',
				value: newValue,
				orig: oldValue,
				mode: 'yaml',
				lineNumbers: true, // * 显示行数
				lineWrapping: true,
				styleActiveLine: true,
				revertButtons: false, // * 确定是都显示允许用户还原更改的按钮
				connect: 'left', // * 设置用于连接更改的代码块的样式
				collapseIdentical: false, // * 是否将为更改的文本进行折叠
				allowEditingOriginals: false // * 原始编辑器是否可编辑
			}
		);
		CodeMirrorInstance.editor().on(
			'change',
			function (editor: any, changeObj: any) {
				setReturnFlag(false);
				setSaveFlag(true);
				setOriginValue(editor.getValue());
			}
		);
		setCodeMirrorInstance(CodeMirrorInstance);
	};
	const saveValueYaml = () => {
		const sendData = {
			middlewareName,
			clusterId,
			namespace,
			type,
			chartVersion,
			values: originValue
		};
		confirm({
			title: '操作确认',
			content: '请确认是否保存编辑后的yaml？',
			onOk: () => {
				updateValueYaml(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: 'yaml编辑成功'
						});
						history.push(
							`/serviceList/${name}/${aliasName}/basicInfo/${middlewareName}/${type}/${chartVersion}/${namespace}`
						);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
						setSaveFlag(true);
						setReturnFlag(false);
					}
				});
			},
			onCancel: () => {
				setSaveFlag(true);
				setReturnFlag(false);
			}
		});
	};
	const correctYaml = () => {
		if (!originValue) return;
		if (yamlMsg[0].messageStatus === 2) {
			const msgTemp = 'FAILURE: yaml校验失败';
			addYamlMsg(msgTemp, 2);
			setSaveFlag(true);
			return;
		}
		const sendData = {
			yaml: originValue
		};
		verificationYaml(sendData).then((res) => {
			if (res.success && res.data.flag) {
				const msgTemp = 'SUCCESS: yaml校验成功';
				addYamlMsg(msgTemp, 3);
				setSaveFlag(false);
			} else {
				const wrongMessages =
					res.data.msgList.length > 0
						? res.data.msgList.join(',')
						: res.errorMsg;
				addYamlMsg(`FAILURE: ${wrongMessages}`, 2);
				setSaveFlag(true);
			}
		});
	};
	const addYamlMsg = (msg: string, status: number) => {
		setYamlMsg([
			{
				time: '[' + new Date().toLocaleString() + '] ',
				msg: msg,
				messageStatus: status
			},
			...yamlMsg
		]);
	};
	const restoreYaml = () => {
		setSaveFlag(true);
		codeMirrorInstance.editor().setValue(newValue);
		setReturnFlag(true);
	};
	return (
		<ProPage>
			<ProHeader
				title="yaml文件详情"
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Alert
					message="此处修改可能导致部署配置与实际部署配置内容不匹配，请谨慎操作！"
					type="warning"
					showIcon
					style={{ marginBottom: 16 }}
				/>
				<div className="yaml-edit-btn-content">
					<Button
						className="yaml-btn"
						type="primary"
						onClick={saveValueYaml}
						disabled={saveFlag}
					>
						保存
					</Button>
					<Button
						className="yaml-btn"
						type="default"
						onClick={restoreYaml}
						disabled={returnFlag}
					>
						还原
					</Button>
					<Button
						className="yaml-btn"
						type="default"
						onClick={correctYaml}
					>
						校准
					</Button>
				</div>
				<div className="yaml-edit-content">
					<div className="yaml-edit-header">
						<div className="yaml-edit-left-2">yaml编辑器</div>
						<div className="yaml-edit-right-2">原文信息</div>
					</div>
					<div className="yaml-edit-code">
						<div ref={codeEditor} style={{ height: '100%' }}></div>
					</div>
					<div className="yaml-edit-console-header">提示信息</div>
					<div className="yaml-edit-console-content">
						<ul>
							{yamlMsg.map((msg, index) => (
								<li key={index} style={{ display: 'flex' }}>
									<pre className="codeIDE-pre-code">
										{msg.time}
									</pre>
									<pre
										className="codeIDE-pre-code"
										style={{
											color: msgColor[msg.messageStatus]
										}}
									>
										{msg.msg}
									</pre>
								</li>
							))}
						</ul>
					</div>
				</div>
			</ProContent>
		</ProPage>
	);
};
export default YamlEdit;
