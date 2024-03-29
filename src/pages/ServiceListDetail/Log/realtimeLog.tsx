import React, { useState, useEffect, useRef } from 'react';
import {
	Select,
	Row,
	Col,
	Radio,
	RadioChangeEvent,
	Popover,
	Space
} from 'antd';
import {
	ArrowsAltOutlined,
	QuestionCircleOutlined,
	ShrinkOutlined
} from '@ant-design/icons';
import { connect } from 'react-redux';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { setRealLog, cleanRealLog } from '@/redux/log/log';

import Socket from '@/services/websocket.js';
import { getPods } from '@/services/middleware';

import { ContainerItem, PodItem, RealTimeProps } from '../detail';
import { StoreState } from '@/types';

import styles from './log.module.scss';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/twilight.css';

const { Option } = Select;
const { Group: RadioGroup } = Radio;

const RealtimeLog = (props: RealTimeProps) => {
	const { setRealLog, cleanRealLog } = props;
	const { type, middlewareName, clusterId, namespace } = props.data;
	const options = {
		mode: 'xml',
		theme: 'twilight',
		readOnly: true,
		lineNumbers: true,
		fullScreen: false,
		lineWrapping: true
	};

	const [pod, setPod] = useState<string>('');
	const [podList, setPodList] = useState<PodItem[]>([]);
	const [container, setContainer] = useState<string>('');
	const [containerList, setContainerList] = useState<ContainerItem[]>([]);
	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
	const [terminalType, setTerminalType] = useState<string>('stdoutlog');
	const [lastRestart, setLastRestart] = useState<number>(0);
	const [websocketFlag, setWebsocketFlag] = useState<number>(0);
	const ws = useRef<any>(null);

	const changePod = (value: string) => {
		setPod(value);
		for (let i = 0; i < podList.length; i++) {
			if (value === podList[i].podName) {
				setLastRestart(podList[i].restartCount);
				setContainerList(podList[i].containers);
				if (podList[i].containers.length > 0) {
					cleanRealLog();
					setContainer(podList[i].containers[0].name);
				}
				break;
			}
		}
	};

	const changeContainr = (value: string) => {
		cleanRealLog();
		setContainer(value);
	};

	const screenExtend = () => {
		setIsFullscreen(true);
	};

	const screenShrink = () => {
		setIsFullscreen(false);
	};
	useEffect(() => {
		if (clusterId && namespace && middlewareName) {
			getPods({ clusterId, namespace, middlewareName, type }).then(
				(res) => {
					if (res.success) {
						setPodList(res.data.pods);
						if (res.data.pods.length > 0) {
							setPod(res.data.pods[0].podName);
							setLastRestart(res.data.pods[0].restartCount);
							setContainerList(res.data.pods[0].containers);
							if (res.data.pods[0].containers.length > 0) {
								setContainer(
									res.data.pods[0].containers[0].name
								);
							}
						}
					}
				}
			);
		}
	}, [clusterId, namespace, middlewareName]);

	useEffect(() => {
		cleanRealLog();
		if (pod && container) {
			console.log(props);
			ws.current = new Socket({
				socketUrl: `/terminal?terminalType=${terminalType}&pod=${pod}&namespace=${namespace}&container=${container}&clusterId=${clusterId}`,
				timeout: 5000,
				socketMessage: (receive: any) => {
					setWebsocketFlag(websocketFlag + 1);
					console.log(receive);
					console.log(props);
					const content = props.log + JSON.parse(receive.data).text;
					// const content =JSON.parse(receive.data).text;
					setRealLog(content);
				},
				socketClose: (msg: any) => {
					cleanRealLog();
				},
				socketError: () => {
					console.log('连接建立失败');
				},
				socketOpen: () => {
					console.log('连接建立成功');
				}
			});
			try {
				ws.current.connection();
			} catch (e) {
				// * 捕获异常，防止js error
				console.log(e);
			}
			return () => {
				ws.current.onclose();
			};
		}
		return () => {
			cleanRealLog();
		};
	}, [pod, container, terminalType]);

	return (
		<>
			<div className={`display-flex ${styles['filter-wrapper']}`}>
				<div className={styles['filter-item-realtime']}>
					<Row align="middle">
						<Col span={5}>
							<Space>
								<label>日志类型</label>
								<Popover
									content={
										<span
											style={{
												lineHeight: '18px'
											}}
										>
											通过kubectl logs{' '}
											-f命令获得的实时日志信息
										</span>
									}
								>
									<QuestionCircleOutlined />
								</Popover>
							</Space>
						</Col>
						<Col span={19}>
							<RadioGroup
								value={terminalType}
								onChange={(e: RadioChangeEvent) => {
									cleanRealLog();
									setTerminalType(e.target.value);
								}}
							>
								<Radio id="stdoutlog" value="stdoutlog">
									实时日志
								</Radio>
								<Radio
									id="previousLog"
									value="previousLog"
									disabled={lastRestart === 0}
								>
									上一次重启日志
								</Radio>
							</RadioGroup>
						</Col>
					</Row>
				</div>
			</div>
			<div className={`display-flex ${styles['filter-wrapper']}`}>
				<div className={styles['filter-item-realtime']}>
					<Row align="middle">
						<Col span={5}>
							<label>实例列表</label>
						</Col>
						<Col span={19}>
							<Select
								placeholder="请选择实例"
								value={pod}
								onChange={changePod}
								style={{ width: '100%' }}
								dropdownMatchSelectWidth={false}
							>
								{podList.map((item, index) => (
									<Option value={item.podName} key={index}>
										{item.podName}
									</Option>
								))}
							</Select>
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item-realtime']}>
					<Row align="middle">
						<Col offset={2} span={3}>
							<label>容器列表</label>
						</Col>
						<Col span={19}>
							<Select
								placeholder="请选择容器"
								value={container}
								onChange={changeContainr}
								style={{ width: '100%' }}
								dropdownMatchSelectWidth={false}
							>
								{containerList.map((item, index) => (
									<Option value={item.name} key={index}>
										{item.name}
									</Option>
								))}
							</Select>
						</Col>
					</Row>
				</div>
			</div>
			<div
				className={`${styles['log-display']} ${
					isFullscreen ? 'log-full-screen' : ''
				}`}
				style={{ marginTop: 16 }}
			>
				<div className={styles['title']}>
					<div className="display-inline-block">日志详情</div>
					<div className={`display-inline-block ${styles['tips']}`}>
						{!isFullscreen && (
							<ArrowsAltOutlined onClick={screenExtend} />
						)}
						{isFullscreen && (
							<ShrinkOutlined onClick={screenShrink} />
						)}
					</div>
				</div>
				<CodeMirror
					value={props.log}
					options={options}
					className="log-codeMirror"
				/>
			</div>
		</>
	);
};
const mapStateToProps = (state: StoreState) => ({
	log: state.log.log
});
export default connect(mapStateToProps, {
	setRealLog,
	cleanRealLog
})(RealtimeLog);
