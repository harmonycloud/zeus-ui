import React, { useState, useEffect } from 'react';
import { Button } from '@alicloud/console-components';
import Card from './card';
import AddCluster from './addCluster';
import { getClusters } from '@/services/common.js';

import styles from './basicResource.module.scss';
import iconResource from '@/assets/images/icon-resource.svg';

export default function BasicResource() {
	const [visible, setVisible] = useState(false);
	const [clusterList, setClusterList] = useState([]);

	const listCluster = () => {
		getClusters({ detail: true }).then((res) => {
			if (res.success) {
				setClusterList(res.data);
			}
		});
	};

	const clusterHandle = () => {
		setVisible(!visible);
	};

	useEffect(() => {
		listCluster();
	}, []);

	return (
		<>
			<div className={`display-flex ${styles['cluster-wrapper']}`}>
				<img src={iconResource} width="90" />
				<div className={`display-flex ${styles['cluster-intro']}`}>
					<h2>集群管理</h2>
					<p>
						对多个集群以及每个集群的基础资源，服务组件和资源等的统一管理
					</p>
					<Button type="primary" onClick={clusterHandle}>
						添加集群
					</Button>
				</div>
			</div>
			<div className={`${styles['cluster-list']}`}>
				{clusterList.map((item, index) => (
					<Card
						clusterObj={item}
						key={index}
						updateFn={() => listCluster()}
						style={{ width: '23%' }}
					/>
				))}
			</div>
			{visible && (
				<AddCluster
					visible={visible}
					cancelHandle={() => setVisible(false)}
					updateFn={() => listCluster()}
				/>
			)}
		</>
	);
}
