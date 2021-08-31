import React, { useState, useEffect } from 'react';
import {
	Select,
	Grid,
	Input,
	Button,
	Message
} from '@alicloud/console-components';
import { Icon } from '@alifd/next';
import moment from 'moment';
import styles from './log.module.scss';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/twilight.css';
import {
	getPods,
	getStandardLogFiles,
	getLogDetail,
	download
} from '@/services/middleware';
import TimeSelect from '@/components/TimeSelect';
import transTime from '@/utils/transTime';
import messageConfig from '@/components/messageConfig';

const { Row, Col } = Grid;
const { Option } = Select;
const searchTypes = [
	{ label: '分词搜索', value: 'match' },
	{ label: '精确搜索', value: 'matchPhrase' },
	{ label: '模糊搜索', value: 'wildcard' },
	{ label: '正则表达式搜索', value: 'regexp' }
];
export default function StandardLog(props) {
	const { type, middlewareName, clusterId, namespace } = props.data;
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [logs, setLogs] = useState('');

	const options = {
		mode: 'xml',
		theme: 'twilight',
		readOnly: true,
		lineNumbers: true,
		fullScreen: false,
		lineWrapping: true
	};
	const [pod, setPod] = useState('all');
	const [podList, setPodList] = useState([]);
	const [container, setContainer] = useState('all');
	const [searchType, setSearchType] = useState('matchPhrase');
	const [containerList, setContainerList] = useState([]);
	const [keyword, setKeyword] = useState();
	const [logFiles, setLogFiles] = useState([]); // 日志文件列表
	const [currentLogFile, setCurrentLogFile] = useState(); // 选中的日志文件
	const defaultStart = moment().subtract({ hours: 1 });
	const [rangeTime, setRangeTime] = useState([defaultStart, moment()]);
	const [scrollId, setScrollId] = useState();
	const [logList, setLogList] = useState([]);
	const [total, setTotal] = useState(0);

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

	useEffect(() => {
		if (clusterId && namespace && middlewareName) {
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
	}, [clusterId, namespace, middlewareName]);

	useEffect(() => {
		setLogs(logList.join('\n'));
	}, [logList]);

	useEffect(() => {
		if (currentLogFile) {
			const [start, end] = rangeTime;
			const startTime = transTime.local2gmt2(start);
			const endTime = transTime.local2gmt2(end);
			const sendData = {
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
	const getLogFiles = (sendData) => {
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
					setCurrentLogFile();
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// * 查询日志详情
	const getLog = (sendData) => {
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
						const logs = res.data.log.map((item) => item.msg);
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
						const log = res.data.log.map((item) => item.msg);
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

	const changeContainr = (value) => {
		setContainer(value);
	};

	const screenExtend = () => {
		setIsFullscreen(true);
	};

	const screenShrink = () => {
		setIsFullscreen(false);
	};

	const onTimeChange = (rangeTime) => {
		setRangeTime(rangeTime);
	};

	const changeSearchType = (value) => {
		setSearchType(value);
	};

	const handleChange = (value) => {
		setKeyword(value);
	};

	const logFilesClick = (value) => {
		setLogList([]);
		setCurrentLogFile(value);
	};
	// 查询文件列表
	const handleClick = () => {
		const [start, end] = rangeTime;
		const startTime = transTime.local2gmt2(start);
		const endTime = transTime.local2gmt2(end);
		const sendData = {
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
		const sendData = {
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
			logPath: currentLogFile.logPath
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		getLog(sendData);
	};

	const downloadLog = () => {
		const [start, end] = rangeTime;
		const startTime = transTime.local2gmt2(start);
		const endTime = transTime.local2gmt2(end);
		const sendData = {
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
			logPath: currentLogFile.logPath
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		const _url = download(sendData);
		const url = `${_url}?logTimeEnd=${endTime}&logTimeStart=${startTime}&pageSize=500&podLog=true${
			pod === 'all' ? '' : `&pod=${pod}`
		}${container === 'all' ? '' : `&container=${container}`}&searchWord=${
			keyword || ''
		}&searchType=${searchType}&middlewareType=${type}&logPath=${
			currentLogFile.logPath
		}`;
		window.open(url, '_target');
	};

	return (
		<div>
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
								<Option value="all">全部</Option>
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
				<div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>搜索类型</label>
						</Col>
						<Col span={16}>
							<Select
								placeholder="请选择搜索类型"
								value={searchType}
								onChange={changeSearchType}
								style={{ width: '100%' }}
							>
								{searchTypes.map((item) => (
									<Option key={item.value} value={item.value}>
										{item.label}
									</Option>
								))}
							</Select>
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>关键字</label>
						</Col>
						<Col span={16}>
							<Input
								style={{ width: '100%' }}
								value={keyword}
								onChange={handleChange}
							/>
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item']}>
					<Row>
						<TimeSelect source="log" timeSelect={onTimeChange} />
					</Row>
				</div>
				<div className={styles['filter-item']}>
					<Row>
						<Col offset={18}>
							<Button type="primary" onClick={handleClick}>
								搜索
							</Button>
						</Col>
					</Row>
				</div>
			</div>
			{logFiles.length > 0 && (
				<div className="display-flex flex-column">
					<div>实例节点数：{logFiles.length}</div>
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
					<div className={`display-inline-block ${styles['tips']}`}>
						<div
							className={`display-inline-block ${styles['btn']}`}
							onClick={downloadLog}
						>
							日志导出 <Icon size="xs" type="download1" />
						</div>
						{/* <div
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
					value={logs}
					options={options}
					className="log-codeMirror"
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
			</div>
		</div>
	);
}
