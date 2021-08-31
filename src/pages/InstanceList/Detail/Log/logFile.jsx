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
	getLogDetail,
	download,
	getStandardLogFiles
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
const options = {
	mode: 'xml',
	theme: 'twilight',
	readOnly: true,
	lineNumbers: true,
	fullScreen: false,
	lineWrapping: true
};
export default function LogFile(props) {
	const { type, middlewareName, clusterId, namespace } = props.data;
	// *------------显示-------------------
	// * 日志显示是否全屏
	const [isFullscreen, setIsFullscreen] = useState(false);
	// *------------筛选-------------------
	// * 选择的pod节点 & 节点的下拉列表
	const [pod, setPod] = useState('all');
	const [podList, setPodList] = useState([]);
	// * 选择的容器 & 容器下拉列表
	const [container, setContainer] = useState('all');
	const [containerList, setContainerList] = useState([]);
	// * 搜搜类型
	const [searchType, setSearchType] = useState('matchPhrase');
	// * 关键词
	const [keyword, setKeyword] = useState();
	// * 选择的日志目录和日志目录下拉列表
	// const [logIndex, setLogIndex] = useState('');
	// const [logIndexs, setLogIndexs] = useState([]);
	// * 日期选择 时间段选择
	const defaultStart = moment().subtract({ hours: 1 });
	const [rangeTime, setRangeTime] = useState([defaultStart, moment()]);
	// *------------数据-------------------
	// * 查询日志详情的分页，第一次获取不用传。
	const [scrollId, setScrollId] = useState();
	// * 显示的日志信息
	const [logs, setLogs] = useState('');
	// * 日志信息列表
	const [logList, setLogList] = useState([]);
	// * 日志信息总数
	const [total, setTotal] = useState(0);
	// * logPath & logPaths  搜索后获取的日志文件和日志文件列表
	const [logPath, setLogPath] = useState();
	const [logPaths, setLogPaths] = useState([]);

	// * 当logList发生变化是去更新logs内容
	useEffect(() => {
		setLogs(logList.join('\n'));
	}, [logList]);

	useEffect(() => {
		if (logPath) {
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
				podLog: false,
				pod: pod,
				container: container,
				searchWord: keyword,
				searchType: searchType,
				middlewareType: type,
				logPath: logPath.logPath
			};
			if (pod === 'all') delete sendData.pod;
			if (container === 'all') delete sendData.container;
			getLog(sendData);
		}
	}, [logPath]);
	// *------------显示-------------------
	const screenExtend = () => {
		setIsFullscreen(true);
	};

	const screenShrink = () => {
		setIsFullscreen(false);
	};
	// *------------筛选-------------------
	// * 获取pod列表和容器列表
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

	// * 当选择了节点和容器时，查询日志目录
	// useEffect(() => {
	// 	if (pod !== 'all' && container !== 'all') {
	// 		// * 获取日志目录
	// 		getLogIndexs(pod, container);
	// 	}
	// }, [pod, container]);

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
	// todo 优化 方法合并 可做可不做
	const changeContainr = (value) => {
		setContainer(value);
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
	// const fileChange = (value) => {
	// 	setLogIndex(value);
	// };
	const logFilesClick = (value) => {
		setLogList([]);
		setLogPath(value);
	};
	// * 搜索
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
			podLog: false,
			pod: pod,
			container: container,
			searchWord: keyword,
			searchType: searchType,
			middlewareType: type
			// logDir: logIndex
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		// if (pod === 'all' && container === 'all') delete sendData.logDir;
		getLogFiles(sendData);
	};
	// * 查询日志文件
	const getLogFiles = (sendData) => {
		getStandardLogFiles(sendData).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					setLogPaths(res.data);
					setLogPath(res.data[0]);
				} else {
					Message.show(
						messageConfig(
							'error',
							'失败',
							'根据当前查询条件未查询到任何日志文件。'
						)
					);
					setLogPaths([]);
					setLogPath();
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// * 发情请求
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
	// * 更多日志
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
			podLog: false,
			pod: pod,
			container: container,
			searchWord: keyword,
			searchType: searchType,
			middlewareType: type,
			scrollId: scrollId,
			logPath: logPath.logPath
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		getLog(sendData);
	};
	// * 导出日志
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
			podLog: false,
			pod: pod,
			container: container,
			searchWord: keyword,
			searchType: searchType,
			middlewareType: type,
			scrollId: scrollId ? scrollId : '',
			logPath: logPath.logPath
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		const _url = download(sendData);
		const url = `${_url}?logTimeEnd=${endTime}&logTimeStart=${startTime}&pageSize=500&podLog=false${
			pod === 'all' ? '' : `&pod=${pod}`
		}${container === 'all' ? '' : `&container=${container}`}&searchWord=${
			keyword || ''
		}&searchType=${searchType}&middlewareType=${type}&logPath=${
			logPath.logPath
		}`;
		console.log(url);
		window.open(url, '_target');
	};

	// * 获取日志目录 - 后端无法实现日志目录的筛选
	// const getLogIndexs = (pod, container) => {
	// 	const sendData = {
	// 		clusterId: clusterId,
	// 		namespace: namespace,
	// 		middlewareName: middlewareName,
	// 		middlewareType: type,
	// 		pod: pod,
	// 		container: container
	// 	};
	// 	getLogFileIndex(sendData).then((res) => {
	// 		// * 获取数据后对日志目录进行赋值。
	// 		if (res.success) {
	// 			if (res.data.length > 0) {
	// 				setLogIndexs(res.data);
	// 				setLogIndex(res.data[0]);
	// 			}
	// 		}
	// 	});
	// };

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
				{/* <div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>日志目录</label>
						</Col>
						<Col span={16}>
							<Select
								placeholder="请选择日志目录"
								value={logIndex}
								onChange={fileChange}
								style={{ width: '100%' }}
							>
								{logIndexs.map((item, index) => (
									<Option value={item} key={index}>
										{item}
									</Option>
								))}
							</Select>
						</Col>
					</Row>
				</div> */}
				<div className={styles['filter-item']}>
					<Row>
						<TimeSelect source="log" timeSelect={onTimeChange} />
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
						<Col offset={18}>
							<Button type="primary" onClick={handleClick}>
								搜索
							</Button>
						</Col>
					</Row>
				</div>
			</div>
			{logPaths.length > 0 && (
				<div className="display-flex flex-column">
					<div>日志文件数：{logPaths.length}</div>
					<div className={styles['log-file-flex-wrapper']}>
						{logPaths.map((item) => {
							return (
								<div
									key={item.logPath}
									className={`${styles['log-file-box']} ${
										(logPath && logPath.logPath) ===
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
