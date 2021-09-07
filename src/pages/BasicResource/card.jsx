import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Button, Dialog, Message } from '@alicloud/console-components';
import { Icon } from '@alifd/next';
import { deleteCluster } from '@/services/common';
import AddCluster from './addCluster';
import RegistryNamespace from './registryNamespace';
import tramsTime from '@/utils/transTime';
import messageConfig from '@/components/messageConfig';
import { setRefreshCluster } from '@/redux/globalVar/var';
import DeleteCard from './DeleteCard';

import styles from './basicResource.module.scss';
import iconCluster from '@/assets/images/basicResource/icon-cluster.svg';

function Card(props) {
	const { clusterObj, updateFn, style } = props;
	const [registryFlag, setRegistryFlag] = useState(false);
	const [editFlag, setEditFlag] = useState(false);
	const [deleteVisible, setDeleteVisible] = useState(false);

	const registryHandle = () => {
		setRegistryFlag(!registryFlag);
	};

	const editHandle = () => {
		setEditFlag(!editFlag);
	};

	const deleteFn = (id) => {
		setDeleteVisible(true);
	};

	return (
		<>
			{clusterObj.attributes && (
				<div className={styles['cluster-card']} style={style}>
					<div className={styles['cluster-card-title']}>
						<img src={iconCluster} width="40" />
						<div
							className={styles['title']}
							title={clusterObj.nickname}
						>
							{clusterObj.nickname}
						</div>
					</div>
					<div className={styles['info']}>
						<ul>
							<li>
								<label>注册资源分区数：</label>
								<span>{clusterObj.attributes.nsCount}</span>
							</li>
							<li>
								<label>Kubernetes版本：</label>
								<span>
									{clusterObj.attributes.kubeletVersion}
								</span>
							</li>
							<li>
								<label>注册时间：</label>
								<span>
									{tramsTime.gmt2local(
										clusterObj.attributes.createTime
									)}
								</span>
							</li>
						</ul>
					</div>
					<div className={`display-flex ${styles['btn-group']}`}>
						<Button
							iconSize="xs"
							text={true}
							onClick={registryHandle}
						>
							<Icon type="check-circle" />
							&nbsp;注册
						</Button>
						<p
							className={'vertical-divider'}
							style={{ height: 16 }}
						></p>
						<Button iconSize="xs" text={true} onClick={editHandle}>
							<Icon type="edit1" />
							&nbsp;编辑
						</Button>
						<p
							className={'vertical-divider'}
							style={{ height: 16 }}
						></p>
						<Button
							iconSize="xs"
							text={true}
							onClick={() => deleteFn(clusterObj.id)}
						>
							<Icon type="delete" />
							&nbsp;删除
						</Button>
					</div>
				</div>
			)}
			{registryFlag && (
				<RegistryNamespace
					visible={registryFlag}
					clusterId={clusterObj.id}
					updateFn={updateFn}
					cancelHandle={() => setRegistryFlag(false)}
				/>
			)}
			{editFlag && (
				<AddCluster
					visible={editFlag}
					clusterId={clusterObj.id}
					updateFn={updateFn}
					cancelHandle={() => setEditFlag(false)}
				/>
			)}
			{deleteVisible && (
				<DeleteCard
					visible={deleteVisible}
					id={clusterObj.id}
					updateFn={updateFn}
					onCancel={() => setDeleteVisible(false)}
				/>
			)}
		</>
	);
}
export default connect(() => ({}), {
	setRefreshCluster
})(Card);
