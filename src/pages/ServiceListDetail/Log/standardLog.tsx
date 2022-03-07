import React, { useState, useEffect } from 'react';
import {
	Select,
	Grid,
	Input,
	Button,
	Message,
	Balloon,
	Switch,
	Icon
} from '@alicloud/console-components';
import { useParams } from 'react-router';
import moment, { Moment } from 'moment';
import { Controlled as CodeMirror } from 'react-codemirror2';
import TimeSelect from '@/components/TimeSelect';
import messageConfig from '@/components/messageConfig';
import ComponentsNull from '@/components/ComponentsNull';
import SwitchForm from './SwitchForm';
import {
	getPods,
	getStandardLogFiles,
	getLogDetail,
	download
} from '@/services/middleware';
import { searchTypes } from '@/utils/const';
import transTime from '@/utils/transTime';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/twilight.css';
import styles from './log.module.scss';

import {
	CommonLogProps,
	ContainerItem,
	DetailParams,
	DownLoadLogSendData,
	LogDetailItem,
	LogFileItem,
	PodItem
} from '../detail';
import { Editor } from 'codemirror';

const { Row, Col } = Grid;
const { Option } = Select;

export default function StandardLog(props: CommonLogProps): JSX.Element {
	const { logging, onRefresh } = props;
	console.log(props);
	const params: DetailParams = useParams();
	const { chartVersion } = params;
	const {
		type,
		middlewareName,
		clusterId,
		namespace,
		data: { stdoutEnabled }
	} = props.data;
	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
	const [logs, setLogs] = useState<string>('');

	const options = {
		mode: 'xml',
		theme: 'twilight',
		readOnly: true,
		lineNumbers: true,
		fullScreen: false,
		lineWrapping: true
	};

	const [pod, setPod] = useState<string>('all');
	const [podList, setPodList] = useState<PodItem[]>([]);
	const [container, setContainer] = useState<string>('all');
	const [searchType, setSearchType] = useState<string>('matchPhrase');
	const [containerList, setContainerList] = useState<ContainerItem[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [logFiles, setLogFiles] = useState<LogFileItem[]>([]); // 日志文件列表
	const [currentLogFile, setCurrentLogFile] = useState<LogFileItem>(); // 选中的日志文件
	const defaultStart = moment().subtract({ hours: 1 });
	const [rangeTime, setRangeTime] = useState<Moment[]>([
		defaultStart,
		moment()
	]);
	const [scrollId, setScrollId] = useState();
	const [logList, setLogList] = useState<string[]>([]);
	const [total, setTotal] = useState(0);
	const [standardLog, setStandardLog] = useState<boolean>(
		stdoutEnabled || false
	);
	const [switchVisible, setSwitchVisible] = useState<boolean>(false);

	const changePod = (value: string) => {
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
	useEffect(() => {
		setStandardLog(props.data.data.stdoutEnabled);
	}, [props.data.data.stdoutEnabled]);

	useEffect(() => {
		if (
			clusterId &&
			namespace &&
			middlewareName &&
			logging &&
			stdoutEnabled
		) {
			getPods({ clusterId, namespace, middlewareName, type }).then(
				(res) => {
					if (res.success) {
						setPodList(res.data.pods);
						if (res.data.pods.length > 0) {
							setContainerList(res.data.pods[0].containers);
						}
					}
				}
			);
		}
	}, [clusterId, namespace, middlewareName, stdoutEnabled]);

	useEffect(() => {
		setLogs(logList.join('\n'));
	}, [logList]);

	useEffect(() => {
		if (currentLogFile) {
			const [start, end] = rangeTime;
			const startTime = transTime.local2gmt2(start);
			const endTime = transTime.local2gmt2(end);
			const sendData: DownLoadLogSendData = {
				clusterId: clusterId,
				namespace: namespace,
				middlewareName: middlewareName,
				logTimeEnd: endTime,
				logTimeStart: startTime,
				pageSize: 500,
				podLog: true,
				pod: pod,
				container: container,
				searchWord: keyword,
				searchType: searchType,
				middlewareType: type,
				logPath: currentLogFile.logPath
			};
			if (pod === 'all') delete sendData.pod;
			if (container === 'all') delete sendData.container;
			getLog(sendData);
		}
	}, [currentLogFile]);

	// 查询日志文件
	const getLogFiles = (sendData: any) => {
		getStandardLogFiles(sendData).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					setLogFiles(res.data);
					setCurrentLogFile(res.data[0]);
				} else {
					Message.show(
						messageConfig(
							'error',
							'失败',
							'根据当前查询条件未查询到任何日志文件。'
						)
					);
					setLogFiles([]);
					setCurrentLogFile(undefined);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// * 查询日志详情
	const getLog = (sendData: any) => {
		getLogDetail(sendData).then((res) => {
			if (res.success) {
				if (sendData.scrollId) {
					if (res.data.log.length === 0) {
						Message.show(
							messageConfig(
								'error',
								'失败',
								'当前日志文件已经查询结束。'
							)
						);
					} else {
						const logs = res.data.log.map(
							(item: LogDetailItem) => item.msg
						);
						setLogList([...logList, ...logs]);
					}
				} else {
					if (res.data.log.length === 0) {
						Message.show(
							messageConfig(
								'error',
								'失败',
								'当前日志文件没有信息。'
							)
						);
						setLogList([]);
					} else {
						const log = res.data.log.map(
							(item: LogDetailItem) => item.msg
						);
						setScrollId(res.data.scrollId);
						setLogList(log);
						setTotal(res.data.totalHit);
					}
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const changeContainr = (value: string) => {
		setContainer(value);
	};

	const screenExtend = () => {
		setIsFullscreen(true);
	};

	const screenShrink = () => {
		setIsFullscreen(false);
	};

	const onTimeChange = (rangeTime: Moment[]) => {
		setRangeTime(rangeTime);
	};

	const changeSearchType = (value: string) => {
		setSearchType(value);
	};

	const handleChange = (value: string) => {
		setKeyword(value);
	};

	const logFilesClick = (value: LogFileItem) => {
		setLogList([]);
		setCurrentLogFile(value);
	};
	const onBeforeChange = (editor: Editor) => {
		console.log(editor);
	};
	// 查询文件列表
	const handleClick = () => {
		const [start, end] = rangeTime;
		const startTime = transTime.local2gmt2(start);
		const endTime = transTime.local2gmt2(end);
		const sendData: DownLoadLogSendData = {
			clusterId: clusterId,
			namespace: namespace,
			middlewareName: middlewareName,
			logTimeEnd: endTime,
			logTimeStart: startTime,
			pageSize: 500,
			podLog: true,
			pod: pod,
			container: container,
			searchWord: keyword,
			searchType: searchType,
			middlewareType: type
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		// 获取日志文件
		getLogFiles(sendData);
	};
	// 更多日志
	const moreLogs = () => {
		const [start, end] = rangeTime;
		const startTime = transTime.local2gmt2(start);
		const endTime = transTime.local2gmt2(end);
		const sendData: DownLoadLogSendData = {
			clusterId: clusterId,
			namespace: namespace,
			middlewareName: middlewareName,
			logTimeEnd: endTime,
			logTimeStart: startTime,
			pageSize: 500,
			podLog: true,
			pod: pod,
			container: container,
			searchWord: keyword,
			searchType: searchType,
			middlewareType: type,
			scrollId: scrollId,
			logPath: currentLogFile?.logPath
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		getLog(sendData);
	};

	const downloadLog = () => {
		const [start, end] = rangeTime;
		const startTime = transTime.local2gmt2(start);
		const endTime = transTime.local2gmt2(end);
		const sendData: DownLoadLogSendData = {
			clusterId: clusterId,
			namespace: namespace,
			middlewareName: middlewareName,
			logTimeEnd: endTime,
			logTimeStart: startTime,
			pageSize: 500,
			podLog: true,
			pod: pod,
			container: container,
			searchWord: keyword,
			searchType: searchType,
			middlewareType: type,
			scrollId: scrollId ? scrollId : '',
			logPath: currentLogFile?.logPath
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		const _url = download(sendData);
		const url = `${_url}?logTimeEnd=${endTime}&logTimeStart=${startTime}&pageSize=500&podLog=true${
			pod === 'all' ? '' : `&pod=${pod}`
		}${container === 'all' ? '' : `&container=${container}`}&searchWord=${
			keyword || ''
		}&searchType=${searchType}&middlewareType=${type}&logPath=${
			currentLogFile?.logPath
		}`;
		window.open(url, '_target');
	};

	const uploadSwitch = (flag: boolean) => {
		if (!flag) {
			setStandardLog(!standardLog);
		} else {
			setTimeout(() => {
				onRefresh && onRefresh();
			}, 5000);
		}
		setSwitchVisible(false);
	};

	if (!logging || !logging.elasticSearch) {
		return (
			<ComponentsNull title="该功能所需要日志采集组件工具支持，您可前往“资源池——>平台组件“进行安装" />
		);
	}

	return (
		<div>
			<ul className="form-layout display-flex flex-align">
				<li className="display-flex form-li">
					<label className="form-name">
						<span style={{ marginRight: 8 }}>标准日志收集</span>
						<Balloon
							trigger={<Icon type="question-circle" size="xs" />}
							closable={false}
						>
							<span
								style={{
									lineHeight: '18px'
								}}
							>
								安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。
							</span>
						</Balloon>
					</label>
					<div
						className={`form-content display-flex flex-align ${styles['standard-log']}`}
					>
						<div className={styles['switch']}>
							{standardLog ? '已开启' : '关闭'}
							<Switch
								checked={standardLog}
								onChange={(value) => {
									setStandardLog(value);
									setSwitchVisible(true);
								}}
								size="small"
								style={{
									marginLeft: 16,
									verticalAlign: 'middle'
								}}
							/>
						</div>
					</div>
				</li>
			</ul>
			<div className={styles['zeus-log-content']}>
				<div
					title="启用该功能后可操作，查看日志"
					className={styles['zeus-log-block-disabled']}
					style={{ display: standardLog ? 'none' : 'block' }}
				></div>
				<div className={`display-flex ${styles['filter-wrapper']}`}>
					<div className={styles['filter-item-standard']}>
						<Row>
							<Col span={5}>
								<label>实例列表</label>
							</Col>
							<Col span={19}>
								<Select
									placeholder="请选择实例"
									value={pod}
									onChange={changePod}
									style={{ width: '100%' }}
								>
									<Option value="all">全部</Option>
									{podList.map((item, index) => (
										<Option
											value={item.podName}
											key={index}
										>
											{item.podName}
										</Option>
									))}
								</Select>
							</Col>
						</Row>
					</div>
					<div className={styles['filter-item-standard']}>
						<Row>
							<Col offset={2} span={3}>
								<label>容器列表</label>
							</Col>
							<Col span={19}>
								<Select
									placeholder="请选择容器"
									value={container}
									onChange={changeContainr}
									style={{ width: '100%' }}
								>
									<Option value="all">全部</Option>
									{containerList.map((item, index) => (
										<Option value={item.name} key={index}>
											{item.name}
										</Option>
									))}
								</Select>
							</Col>
						</Row>
					</div>
					<div className={styles['filter-item-standard']}>
						<Row>
							<Col span={5}>
								<label>搜索类型</label>
							</Col>
							<Col span={19}>
								<Select
									placeholder="请选择搜索类型"
									value={searchType}
									onChange={changeSearchType}
									style={{ width: '100%' }}
								>
									{searchTypes.map((item) => (
										<Option
											key={item.value}
											value={item.value}
										>
											{item.label}
										</Option>
									))}
								</Select>
							</Col>
						</Row>
					</div>
					<div className={styles['filter-item-standard']}>
						<Row>
							<Col offset={2} span={3}>
								<label>关键字</label>
							</Col>
							<Col span={19}>
								<Input
									style={{ width: '100%' }}
									value={keyword}
									onChange={handleChange}
								/>
							</Col>
						</Row>
					</div>
					<div className={styles['filter-item-standard']}>
						<Row>
							<TimeSelect
								source="log"
								timeSelect={onTimeChange}
							/>
						</Row>
					</div>
					<div className={styles['filter-item-standard']}>
						<Button type="primary" onClick={handleClick}>
							搜索
						</Button>
					</div>
				</div>
				{logFiles.length > 0 && (
					<div className="display-flex flex-column">
						<div>服务节点数：{logFiles.length}</div>
						<div className={styles['log-file-flex-wrapper']}>
							{logFiles.map((item) => {
								return (
									<div
										key={item.logPath}
										className={`${styles['log-file-box']} ${
											(currentLogFile &&
												currentLogFile.logPath) ===
											item.logPath
												? styles['active']
												: ''
										}`}
										onClick={() => logFilesClick(item)}
									>
										{item.name}
									</div>
								);
							})}
						</div>
					</div>
				)}
				<div
					className={`${styles['log-display']} ${
						isFullscreen ? 'log-full-screen' : ''
					}`}
					style={{ marginTop: 16 }}
				>
					<div className={styles['title']}>
						<div className="display-inline-block">日志详情</div>
						<div
							className={`display-inline-block ${styles['tips']}`}
						>
							<div
								className={`display-inline-block ${styles['btn']}`}
								onClick={downloadLog}
							>
								日志导出 <Icon size="xs" type="download1" />
							</div>
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
						value={logs}
						options={options}
						className="log-codeMirror"
						onBeforeChange={onBeforeChange}
					/>
					{total > logList.length ? (
						<div className={styles['foot']}>
							<div className="display-inline-block">
								<span
									className={styles['foot-text']}
									onClick={moreLogs}
								>
									更多日志 {'>'}
									{'>'}
								</span>
							</div>
						</div>
					) : null}
					{switchVisible && (
						<SwitchForm
							visible={switchVisible}
							source="standard"
							flag={standardLog}
							data={{
								clusterId,
								namespace,
								middlewareName,
								type,
								chartName: type,
								chartVersion:
									chartVersion || props.data.data.chartVersion
							}}
							onCancel={uploadSwitch}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
