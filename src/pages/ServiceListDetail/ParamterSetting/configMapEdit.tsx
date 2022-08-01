import React, { useEffect, useState, useRef } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { Button, notification, Modal, Select, Alert } from 'antd';
import { useParams } from 'react-router';
import {
	getConfigMapList,
	getConfigMap,
	updateConfig,
	verificationYaml
} from '@/services/configmap';
import yaml from 'js-yaml';
import 'codemirror/addon/selection/active-line';

const { confirm } = Modal;
const msgColor = {
	1: '#f9a144',
	2: '#EF595C',
	3: '#68B642'
};

interface ParamsProps {
	chartVersion: string;
	middlewareName: string;
	type: string;
}
interface ConfigMapEditProp {
	clusterId: string;
	namespace: string;
}
interface YamlMsgProp {
	time: string;
	msg: string;
	messageStatus: number;
}
const Option = Select.Option;
const ConfigMapEdit = (props: ConfigMapEditProp) => {
	const { clusterId, namespace } = props;
	const { chartVersion, middlewareName, type }: ParamsProps = useParams();
	const [originValue, setOriginValue] = useState<string>('');
	const [value, setValue] = useState<string>('');
	const [list, setList] = useState<string[]>([]);
	const [currentConfig, setCurrentConfig] = useState<string>('');
	const [yamlMsg, setYamlMsg] = useState<YamlMsgProp[]>([]);
	const [saveFlag, setSaveFlag] = useState<boolean>(true);
	const [returnFlag, setReturnFlag] = useState<boolean>(true);
	const timeoutId = useRef(0);
	useEffect(() => {
		if (!value) return;
		const parseYaml = () => {
			try {
				yaml.loadAll(value);
				const msgTemp = 'YAML: Format check successful';
				addYamlMsg(msgTemp, 1);
			} catch (err: any) {
				const msgTemp = `${err.name}: ${err.message}`;
				setSaveFlag(true);
				addYamlMsg(msgTemp, 2);
			}
		};
		timeoutId.current = setTimeout(parseYaml, 500) as unknown as number;
		return () => {
			clearTimeout(timeoutId.current);
		};
	}, [value]);
	useEffect(() => {
		if (clusterId && namespace) {
			const sendData = {
				chartVersion,
				middlewareName,
				type,
				clusterId,
				namespace
			};
			getConfigMapList(sendData).then((res) => {
				if (res.success) {
					setList(res.data);
					if (res.data.length > 0) {
						setCurrentConfig(res.data[0]);
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
					setList([]);
				}
			});
		}
	}, [props]);
	useEffect(() => {
		if (currentConfig !== '') {
			getCurrentConfig(currentConfig);
		}
	}, [currentConfig]);
	const getCurrentConfig = (currentConfig: string) => {
		const sendData = {
			clusterId,
			namespace,
			configMapName: currentConfig
		};
		getConfigMap(sendData).then((res) => {
			if (res.success) {
				setOriginValue(res.data);
				setValue(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const handleChange = (value: string) => {
		setCurrentConfig(value);
	};
	const onSave = () => {
		confirm({
			title: '操作确认',
			content: '修改ConfigMap存在危险性，是否继续？',
			onOk: () => {
				const sendData = {
					clusterId,
					config: value,
					configMapName: currentConfig,
					namespace
				};
				return updateConfig(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description:
								'ConfigMap修改成功，需要前往实例详情页面重启服务。'
						});
						setSaveFlag(true);
						setReturnFlag(true);
						getCurrentConfig(currentConfig);
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
		if (!value) return;
		if (yamlMsg[0].messageStatus === 2) {
			const msgTemp = 'FAILURE: yaml校验失败';
			addYamlMsg(msgTemp, 2);
			setSaveFlag(true);
			return;
		}
		const sendData = {
			yaml: value
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

	return (
		<div style={{ height: '100%' }}>
			<Alert
				message="此处修改可能导致参数列表与实际参数内容不匹配，请谨慎操作！"
				type="warning"
				showIcon
				style={{ marginBottom: 16 }}
			/>
			<div className="yaml-edit-btn-content">
				<div style={{ marginRight: 8 }}>
					<Select
						onChange={handleChange}
						value={currentConfig}
						// autoWidth={false}
					>
						{list.map((item: string) => {
							return (
								<Option key={item} value={item}>
									{item}
								</Option>
							);
						})}
					</Select>
				</div>
				<Button
					className="yaml-btn"
					type="primary"
					onClick={onSave}
					disabled={saveFlag}
				>
					保存
				</Button>
				<Button
					className="yaml-btn"
					type="default"
					onClick={() => {
						setSaveFlag(true);
						setReturnFlag(true);
						setValue(originValue);
					}}
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
					<div className="yaml-edit-left-1">ConfigMap编辑</div>
					<div className="yaml-edit-right-1">提示信息</div>
				</div>
				<div className="yaml-edit-editor-content">
					<div className="yaml-edit-editor-left">
						<CodeMirror
							value={value}
							options={{
								mode: 'yaml',
								theme: 'twilight',
								lineNumbers: true,
								styleActiveLine: true
							}}
							onBeforeChange={(editor, data, value) => {
								console.log(value);
								setSaveFlag(true);
								setReturnFlag(false);
								setValue(value);
							}}
							onChange={(editor, data, value) => {
								console.log(value);
								setSaveFlag(true);
								setValue(value);
							}}
						/>
					</div>
					<div className="yaml-edit-editor-right">
						<ul>
							{yamlMsg.map((msg, index) => (
								<li key={index}>
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
			</div>
		</div>
	);
};

export default ConfigMapEdit;
