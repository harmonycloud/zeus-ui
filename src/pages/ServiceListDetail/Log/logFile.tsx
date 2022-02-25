import React, { useState, useEffect } from 'react';
import {
	Select,
	Grid,
	Input,
	Button,
	Message
} from '@alicloud/console-components';
import { Icon } from '@alifd/next';
import moment, { Moment } from 'moment';
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
import ComponentsNull from '@/components/ComponentsNull';
import { searchTypes } from '@/utils/const';
import {
	CommonLogProps,
	ContainerItem,
	DownLoadLogSendData,
	LogDetailItem,
	LogFileItem,
	PodItem
} from '../detail';
import { Editor } from 'codemirror';

const { Row, Col } = Grid;
const { Option } = Select;
const options = {
	mode: 'xml',
	theme: 'twilight',
	readOnly: true,
	lineNumbers: true,
	fullScreen: false,
	lineWrapping: true
};
export default function LogFile(props: CommonLogProps): JSX.Element {
	const { logging } = props;
	const { type, middlewareName, clusterId, namespace } = props.data;
	// *------------显示-------------------
	// * 日志显示是否全屏
	const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
	// *------------筛选-------------------
	// * 选择的pod节点 & 节点的下拉列表
	const [pod, setPod] = useState<string>('all');
	const [podList, setPodList] = useState<PodItem[]>([]);
	// * 选择的容器 & 容器下拉列表
	const [container, setContainer] = useState<string>('all');
	const [containerList, setContainerList] = useState<ContainerItem[]>([]);
	// * 搜索类型
	const [searchType, setSearchType] = useState<string>('matchPhrase');
	// * 关键词
	const [keyword, setKeyword] = useState<string>('');
	// * 选择的日志目录和日志目录下拉列表
	// * 日期选择 时间段选择
	const defaultStart = moment().subtract({ hours: 1 });
	const [rangeTime, setRangeTime] = useState<Moment[]>([
		defaultStart,
		moment()
	]);
	// *------------数据-------------------
	// * 查询日志详情的分页，第一次获取不用传。
	const [scrollId, setScrollId] = useState();
	// * 显示的日志信息
	const [logs, setLogs] = useState<string>('');
	// * 日志信息列表
	const [logList, setLogList] = useState<string[]>([]);
	// * 日志信息总数
	const [total, setTotal] = useState<number>(0);
	// * logPath & logPaths  搜索后获取的日志文件和日志文件列表
	const [logPath, setLogPath] = useState<LogFileItem>();
	const [logPaths, setLogPaths] = useState<LogFileItem[]>([]);

	// * 当logList发生变化是去更新logs内容
	useEffect(() => {
		setLogs(logList.join('\n'));
	}, [logList]);

	useEffect(() => {
		if (logPath) {
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

	const changeContainr = (value: string) => {
		setContainer(value);
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
		setLogPath(value);
	};
	// * 搜索
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
			podLog: false,
			pod: pod,
			container: container,
			searchWord: keyword,
			searchType: searchType,
			middlewareType: type
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		getLogFiles(sendData);
	};
	// * 查询日志文件
	const getLogFiles = (sendData: any) => {
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
					setLogPath(undefined);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// * 发情请求
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
	// * 更多日志
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
			podLog: false,
			pod: pod,
			container: container,
			searchWord: keyword,
			searchType: searchType,
			middlewareType: type,
			scrollId: scrollId,
			logPath: logPath?.logPath
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
		const sendData: DownLoadLogSendData = {
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
			logPath: logPath?.logPath
		};
		if (pod === 'all') delete sendData.pod;
		if (container === 'all') delete sendData.container;
		const _url = download(sendData);
		const url = `${_url}?logTimeEnd=${endTime}&logTimeStart=${startTime}&pageSize=500&podLog=false${
			pod === 'all' ? '' : `&pod=${pod}`
		}${container === 'all' ? '' : `&container=${container}`}&searchWord=${
			keyword || ''
		}&searchType=${searchType}&middlewareType=${type}&logPath=${
			logPath?.logPath
		}`;
		// console.log(url);
		window.open(url, '_target');
	};
	const onBeforeChange = (value: Editor) => {
		console.log(value);
	};

	if (!logging || !logging.elasticSearch) {
		return (
			<ComponentsNull title="该功能所需要日志采集组件工具支持，您可前往“资源池——>平台组件“进行安装" />
		);
	}
	return (
		<div>
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
									<Option value={item.podName} key={index}>
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
									<Option key={item.value} value={item.value}>
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
						<TimeSelect source="log" timeSelect={onTimeChange} />
					</Row>
				</div>
				<div className={styles['filter-item-standard']}>
					<Button type="primary" onClick={handleClick}>
						搜索
					</Button>
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
			</div>
		</div>
	);
}
