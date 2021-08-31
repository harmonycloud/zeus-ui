/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Select, Button, Grid, Switch } from '@alicloud/console-components';
import { connect } from 'react-redux';
import { Icon } from '@alifd/next';
import Socket from '@/services/websocket.js';
import cache from '@/utils/storage';
import styles from './log.module.scss';
import { setRealLog, cleanRealLog } from '@/redux/log/log';

import { getPods } from '@/services/middleware';

import { Controlled as CodeMirror } from 'react-codemirror2';
// import 'codemirror/lib/codemirror.js';
// import 'codemirror/addon/display/placeholder.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/twilight.css';
// import 'codemirror/mode/yaml/yaml.js';

const { Row, Col } = Grid;
const { Option } = Select;

const RealtimeLog = (props) => {
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

	const [pod, setPod] = useState('');
	const [podList, setPodList] = useState([]);
	const [container, setContainer] = useState('');
	const [containerList, setContainerList] = useState([]);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const ws = useRef(null);

	const changePod = (value) => {
		setPod(value);
		for (let i = 0; i < podList.length; i++) {
			if (value === podList[i].podName) {
				setContainerList(podList[i].containers);
				if (podList[i].containers.length > 0)
					setContainer(podList[i].containers[0].name);
				break;
			}
		}
	};

	const changeContainr = (value) => {
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
		if (pod && container) {
			cleanRealLog();
			ws.current = new Socket({
				socketUrl: `/terminal?terminalType=stdoutlog&pod=${pod}&namespace=${namespace}&container=${container}&clusterId=${clusterId}`,
				timeout: 5000,
				socketMessage: (receive) => {
					console.log(receive); //后端返回的数据，渲染页面
					// console.log(JSON.parse(receive.data).text);
					let content = props.log + JSON.parse(receive.data).text;
					console.log(content);
					setRealLog(content);
					// se/tLog(content);
				},
				socketClose: (msg) => {
					console.log(msg);
				},
				socketError: () => {
					console.log('连接建立失败');
				},
				socketOpen: () => {
					console.log('连接建立成功');
					// 心跳机制 定时向后端发数据
					// this.taskRemindInterval = setInterval(() => {
					// 	this.socket.sendMessage();
					// }, 30000);
				}
			});
			// // 重试创建socket连接

			// let action = (type, data) => {
			// 	let action = Object.assign(
			// 		{
			// 			type: type
			// 		},
			// 		data
			// 	);
			// 	return JSON.stringify(action);
			// };
			// let ws = new WebSocket(
			// 	`ws://10.10.136.164:8080/terminal?terminalType=stdoutlog&pod=${pod}&namespace=${namespace}&container=${container}&clusterId=${clusterId}`,
			// 	cache.getLocal('token')
			// 	// `ws://10.1.11.167:30088/wscaas/terminal?terminalType=stdoutlog&pod=testng1-67b488dcd5-879td&namespace=shh-zone1&container=nginx&clusterId=test--test71`,
			// 	// `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwidXNlckluZm8iOiJ7XCJyZWFsTmFtZVwiOlwiYWRtaW5cIixcInJvbGVJZFwiOlwiMVwiLFwicm9sZU5hbWVcIjpcImFkbWluXCIsXCJhdHRyaWJ1dGVzXCI6e30sXCJsYW5ndWFnZVwiOlwiY2hcIixcImlkXCI6XCIxXCIsXCJpc0FkbWluXCI6MSxcInByb2plY3ROYW1lXCI6XCJwcm9qZWN0MVwiLFwicHJvamVjdElkXCI6XCI2Y2RhN2RjNDg2ZTE0YjZlXCIsXCJ1c2VybmFtZVwiOlwiYWRtaW5cIn0iLCJleHAiOjE2MjE1MDkwNTQsImlhdCI6MTYyMTUwNDI1NH0.BR1_uRCwyecr1aaWNhOU-eyUqRA0AWwnMW_vnRDYM_I`
			// );
			// ws.onopen = function () {
			// 	console.log('连接建立成功');
			// 	ws.send(action('TERMINAL_INIT'));
			// 	ws.send(action('TERMINAL_READY'));
			// };
			// ws.onerror = function (e) {
			// 	console.log('连接建立失败', e);
			// };
			// ws.onclose = function () {
			// 	console.log('close');
			// };
			// ws.onmessage = function (e) {
			// 	console.log(e.data);
			// };
			try {
				// ws.current.onclose();
				ws.current.connection();
			} catch (e) {
				// 捕获异常，防止js error
				console.log(e);
			}
			return () => {
				ws.current.onclose();
			};
		}
	}, [pod, container]);

	return (
		<>
			<div className={`display-flex ${styles['filter-wrapper']}`}>
				<div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>节点列表</label>
						</Col>
						<Col span={16}>
							<Select
								placeholder="请选择节点"
								value={pod}
								onChange={changePod}
								style={{ width: '100%' }}
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
				<div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>容器列表</label>
						</Col>
						<Col span={16}>
							<Select
								placeholder="请选择容器"
								value={container}
								onChange={changeContainr}
								style={{ width: '100%' }}
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
				{/* <div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>时间区间</label>
						</Col>
						<Col span={16}>
							<Select
								placeholder="请选择时间区间"
								style={{ width: '40%' }}
							>
								<Option value={1}>1</Option>
								<Option value={3}>3</Option>
								<Option value={5}>5</Option>
								<Option value={7}>7</Option>
								<Option value={15}>15</Option>
								<Option value={30}>30</Option>
							</Select>
							<Select
								placeholder="请选择时间单位"
								style={{ width: '60%', marginLeft: -2 }}
							>
								<Option value={'分钟内'}>分钟内</Option>
								<Option value={'小时内'}>小时内</Option>
								<Option value={'天内'}>天内</Option>
							</Select>
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item']}>
					<Button type="primary">搜索</Button>
				</div> */}
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
						{/* <div
							className={`display-inline-block ${styles['btn']}`}
						>
							日志导出 <Icon size="xs" type="download1" />
						</div>
						<div
							className={`display-inline-block ${styles['btn']}`}
						>
							实时日志{' '}
							<Switch
								size="small"
								style={{ verticalAlign: 'middle' }}
							/>
						</div> */}
						{!isFullscreen && (
							<Icon
								type="expand-alt"
								size="xs"
								onClick={screenExtend}
							/>
						)}
						{isFullscreen && (
							<Icon
								type="compress-alt"
								size="xs"
								onClick={screenShrink}
							/>
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

export default connect(
	({ log }) => ({
		log: log.log
	}),
	{
		setRealLog,
		cleanRealLog
	}
)(RealtimeLog);
