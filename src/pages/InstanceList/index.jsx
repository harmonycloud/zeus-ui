import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import Page from '@alicloud/console-components-page';
import MysqlList from './List/mysql';
import RedisList from './List/redis';
import ElasticsearchList from './List/elasticsearch';
import RocketMQList from './List/rocketmq';
import OtherList from './List/other';
import styles from './instance.module.scss';
import { getMiddlewares } from '@/services/middleware.js';
import timerClass from '@/utils/timerClass';
import './instance.scss';

const { Menu } = Page;

function InstanceList(props) {
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const location = useLocation();
	const [mdList, setMdList] = useState([]);
	const [currentKey, setCurrentKey] = useState('');
	const [currentOfficial, setCurrentOfficial] = useState(true);
	const [currentInstance, setCurrentInstance] = useState({});
	const [middlewareType] = useState(location.query && location.query.key);
	let [timer, setTimer] = useState(null);

	const onItemClick = (selectedKeys, item, extra) => {
		setCurrentKey(selectedKeys[0]);
		for (let i = 0; i < mdList.length; i++) {
			if (selectedKeys[0] === mdList[i].name) {
				setCurrentInstance(mdList[i]);
				setCurrentOfficial(mdList[i].official);
				break;
			}
		}
	};

	const CustomMenu = ({ mdList }) => {
		const officialMdList = mdList.filter((item) => item.official === true);
		const customMdList = mdList.filter((item) => item.official === false);
		return (
			<Menu
				id="mid-menu"
				selectedKeys={currentKey}
				onSelect={onItemClick}
			>
				<Menu.Group label="官方中间件">
					{officialMdList.map((item) => (
						<Menu.Item key={item.name}>
							{item.name}{' '}
							{item.replicas > 0 && (
								<span
									className={`${styles['icon-box']} ${
										item.replicasStatus
											? styles['succeed']
											: styles['failed']
									}`}
								>
									{item.replicas}
								</span>
							)}
						</Menu.Item>
					))}
				</Menu.Group>
				<Menu.Group label="第三方中间件">
					{customMdList.map((item) => (
						<Menu.Item key={item.name}>
							{item.name}{' '}
							{item.replicas > 0 && (
								<span
									className={`${styles['icon-box']} ${
										item.replicasStatus
											? styles['succeed']
											: styles['failed']
									}`}
								>
									{item.replicas}
								</span>
							)}
						</Menu.Item>
					))}
				</Menu.Group>
			</Menu>
		);
	};

	const switchContent = (key, official) => {
		let node = null;
		if (official) {
			switch (key) {
				case 'mysql':
					node = (
						<MysqlList
							instance={currentInstance}
							updateList={() =>
								middlewareList(
									globalCluster.id,
									globalNamespace.name
								)
							}
						/>
					);
					break;
				case 'redis':
					node = (
						<RedisList
							instance={currentInstance}
							updateList={() =>
								middlewareList(
									globalCluster.id,
									globalNamespace.name
								)
							}
						/>
					);
					break;
				case 'elasticsearch':
					node = (
						<ElasticsearchList
							instance={currentInstance}
							updateList={() =>
								middlewareList(
									globalCluster.id,
									globalNamespace.name
								)
							}
						/>
					);
					break;
				case 'rocketmq':
					node = (
						<RocketMQList
							instance={currentInstance}
							updateList={() =>
								middlewareList(
									globalCluster.id,
									globalNamespace.name
								)
							}
						/>
					);
					break;
				default:
					node = (
						<OtherList
							instance={currentInstance}
							updateList={() =>
								middlewareList(
									globalCluster.id,
									globalNamespace.name
								)
							}
						/>
					);
					break;
			}
		} else {
			node = (
				<OtherList
					instance={currentInstance}
					updateList={() =>
						middlewareList(globalCluster.id, globalNamespace.name)
					}
				/>
			);
		}
		return node;
	};

	// 全局分区更新
	useEffect(() => {
		if (JSON.stringify(globalNamespace) !== '{}') {
			middlewareList(globalCluster.id, globalNamespace.name);
			// 创建跳转
			if (location.query && location.query.timer)
				setTimer(
					timerClass.countdownTimer(() => {
						middlewareList(globalCluster.id, globalNamespace.name);
					}, 3)
				);
		}
		return () => clearInterval(timer);
	}, [globalNamespace, location]);

	useEffect(() => {
		return () => clearInterval(timer);
	}, []);

	async function middlewareList(clusterId, namespace) {
		let res = await getMiddlewares({ clusterId, namespace });
		if (res.success) {
			if (res.data.length > 0) {
				if (middlewareType || currentKey) {
					const nameListTemp = res.data.map((item) => item.name);
					if (nameListTemp.includes(middlewareType || currentKey)) {
						for (let i = 0; i < res.data.length; i++) {
							if (middlewareType === res.data[i].name) {
								setCurrentKey(res.data[i].name);
								setCurrentInstance(res.data[i]);
								break;
							}
						}
					} else {
						setCurrentKey(res.data[0].name);
						setCurrentInstance(res.data[0]);
					}
				} else {
					setCurrentKey(res.data[0].name);
					setCurrentInstance(res.data[0]);
				}
			}
			setMdList(res.data);
		}
	}

	return (
		<Page>
			<Page.Header title="实例列表" />
			<Page.Content menu={<CustomMenu mdList={mdList} />}>
				<div>{switchContent(currentKey, currentOfficial)}</div>
			</Page.Content>
		</Page>
	);
}

export default connect(({ globalVar }) => ({ globalVar }), {})(InstanceList);
