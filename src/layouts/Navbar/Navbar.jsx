import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import storage from '@/utils/storage';
import { Nav, Select, Message } from '@alicloud/console-components';
import User from './User/User';

import styles from './navbar.module.scss';
import './navbar.scss';
import logo from '@/assets/images/navbar/zeus-logo-small.svg';
import { getClusters, getNamespaces } from '@/services/common';
import {
	setCluster,
	setNamespace,
	setRefreshCluster,
	setGlobalClusterList,
	setGlobalNamespaceList
} from '@/redux/globalVar/var';
import { getUserInformation } from '@/services/user';
import messageConfig from '@/components/messageConfig';

// 资源池、分区不可改变路由名单
const disabledRoute = [
	'/middlewareRepository/mysqlCreate',
	'/middlewareRepository/redisCreate',
	'/middlewareRepository/elasticsearchCreate',
	'/middlewareRepository/rocketmqCreate',
	'/middlewareRepository/dynamicForm',
	'/middlewareRepository/versionManagement',
	'/instanceList/detail'
];

// 资源池、分区不显示路由名单
const hideRoute = [
	'/basicResource',
	'/authManage',
	'/platformOverview',
	'/operationAudit',
	'/userManagement',
	'/resourcePoolManagement',
	'/roleManagement'
];

const header = (
	<div
		className={styles['logo-box']}
		style={{ lineHeight: '48px', textAlign: 'center', padding: '5px 0px' }}
	>
		<img className={styles['logo-png']} src={logo} alt="" />
	</div>
);

function Navbar(props) {
	const {
		user,
		style,
		setCluster,
		setNamespace,
		setRefreshCluster,
		setGlobalClusterList,
		setGlobalNamespaceList
	} = props;
	const { flag } = props.globalVar;
	// console.log(flag);
	const location = useLocation();
	const [currentCluster, setCurrentCluster] = useState({});
	const [currentNamespace, setCurrentNamespace] = useState({});
	const [clusterList, setClusterList] = useState([]);
	const [namespaceList, setNamespaceList] = useState([]);
	// 控制资源池和分区
	const [disabled, setDisabled] = useState(false);
	const [hideFlag, setHideFlag] = useState(false);
	// * 用户信息
	const [nickName, setNickName] = useState('admin');
	const [role, setRole] = useState({ aliasName: '系统管理员' });
	const footer = (nickName, role) => (
		<div className={styles['action-bar']}>
			<div className={styles['action-bar-item']}>
				<User
					className={styles['module']}
					nickName={nickName}
					role={role}
				/>
			</div>
		</div>
	);

	const getUserInfo = async () => {
		let res = await getUserInformation();
		if (res.success) {
			setNickName(res.data.aliasName);
			setRole(res.data);
		} else {
			Message.show(messageConfig('error', '失败', res));
		}
	};

	const getClusterList = async () => {
		let res = await getClusters();
		if (res.success) {
			if (res.data.length > 0) {
				let jsonLocalCluster = storage.getLocal('cluster');
				if (
					jsonLocalCluster &&
					res.data.some((item) => {
						return item.id === JSON.parse(jsonLocalCluster).id;
					})
				) {
					setCurrentCluster(JSON.parse(jsonLocalCluster));
					setCluster(JSON.parse(jsonLocalCluster));
				} else {
					setCurrentCluster(res.data[0]);
					setCluster(res.data[0]);
					storage.setLocal('cluster', JSON.stringify(res.data[0]));
				}
			}
			setClusterList(res.data);
			setGlobalClusterList(res.data);
		}
	};

	const getNamespaceList = async (clusterId) => {
		let res = await getNamespaces({ clusterId, withQuota: true });
		if (res.success) {
			if (res.data.length > 0) {
				let jsonLocalNamespace = storage.getLocal('namespace');
				if (
					jsonLocalNamespace &&
					res.data.some((item) => {
						return (
							item.name === JSON.parse(jsonLocalNamespace).name
						);
					})
				) {
					setCurrentNamespace(JSON.parse(jsonLocalNamespace));
					setNamespace(JSON.parse(jsonLocalNamespace));
				} else {
					setCurrentNamespace(res.data[0]);
					setNamespace(res.data[0]);
					storage.setLocal('namespace', JSON.stringify(res.data[0]));
				}
			}
			setNamespaceList(res.data);
			setGlobalNamespaceList(res.data);
		}
	};

	const clusterHandle = (id) => {
		for (let i = 0; i < clusterList.length; i++) {
			if (clusterList[i].id === id) {
				setCurrentCluster(clusterList[i]);
				setCluster(clusterList[i]);
				storage.setLocal('cluster', JSON.stringify(clusterList[i]));
			}
		}
	};

	const namespaceHandle = (name) => {
		for (let i = 0; i < namespaceList.length; i++) {
			if (namespaceList[i].name === name) {
				setCurrentNamespace(namespaceList[i]);
				setNamespace(namespaceList[i]);
				storage.setLocal('namespace', JSON.stringify(namespaceList[i]));
			}
		}
	};

	useEffect(() => {
		getClusterList();
		getUserInfo();
	}, []);

	useEffect(() => {
		if (flag) {
			getClusterList();
			setRefreshCluster(false);
		}
	}, [flag]);

	useEffect(() => {
		if (JSON.stringify(currentCluster) !== '{}')
			getNamespaceList(currentCluster.id);
	}, [currentCluster]);

	useEffect(() => {
		if (location && location.pathname) {
			// 是否可选择
			if (
				disabledRoute.some((item) => {
					return location.pathname.indexOf(item) > -1;
				})
			)
				setDisabled(true);
			else setDisabled(false);
			// 是否显示
			if (
				hideRoute.some((item) => {
					return location.pathname.indexOf(item) > -1;
				})
			)
				setHideFlag(true);
			else setHideFlag(false);
		}
	}, [location]);

	useEffect(() => {
		/**TODO 用户权限 */
	}, [user]);

	return (
		<div className={styles['middleware-navbar']} style={{ ...style }}>
			<Nav
				className={styles['custom-nav']}
				direction="hoz"
				type="normal"
				header={header}
				footer={footer(nickName, role)}
				embeddable={true}
				style={{
					lineHeight: '48px',
					zIndex: 999
				}}
			>
				{hideFlag === false && (
					<>
						<Select
							className="no-shadow"
							value={currentCluster.id}
							hasBorder={false}
							disabled={disabled}
							onChange={clusterHandle}
						>
							{clusterList.map((cluster, index) => {
								return (
									<Select.Option
										key={index}
										value={cluster.id}
									>
										{cluster.nickname}
									</Select.Option>
								);
							})}
						</Select>
						<Select
							style={{ marginLeft: 16 }}
							className="no-shadow"
							value={currentNamespace.name}
							hasBorder={false}
							disabled={disabled}
							onChange={namespaceHandle}
						>
							{namespaceList.map((namespace, index) => {
								return (
									<Select.Option
										key={index}
										value={namespace.name}
									>
										{namespace.aliasName}
									</Select.Option>
								);
							})}
						</Select>
					</>
				)}
			</Nav>
		</div>
	);
}

export default connect(({ globalVar }) => ({ globalVar }), {
	setCluster,
	setNamespace,
	setRefreshCluster,
	setGlobalClusterList,
	setGlobalNamespaceList
})(Navbar);
