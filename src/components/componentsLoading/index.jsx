import React, { useState } from 'react';
// import noData from '@/assets/images/data-none.png';
import noData from '@/assets/images/nodata.svg';
import { Button, Message } from '@alicloud/console-components';
import ResourceForm from './resourceForm';
import BackupForm from './backupForm';
// import IngressForm from './ingressForm';
import messageConfig from '@/components/messageConfig';
import { dockComponent, deployComponent } from '@/services/common';
import './index.scss';
import DeployMonitorForm from './deployMonitorForm';
import DeployBackupForm from './deployBackupForm';

export default function ComponentsLoading(props) {
	const { type, clusterId } = props;
	const [monitorVisible, setMonitorVisible] = useState(false);
	const [backupVisible, setBackupVisible] = useState(false);
	// const [ingressVisible, setIngressVisible] = useState(false);
	const [deployMonitorVisible, setDeployMonitorVisible] = useState(false);
	const [deployBackupVisible, setDeployBackupVisible] = useState(false);

	const handleClick = () => {
		switch (type) {
			case 'monitor':
				setMonitorVisible(true);
				break;
			case 'backup':
				setBackupVisible(true);
			// case 'ingress':
			// 	setIngressVisible(true);
		}
	};

	const handleDeployClick = () => {
		switch (type) {
			case 'monitor':
				setDeployMonitorVisible(true);
				break;
			case 'backup':
				setDeployBackupVisible(true);
			// case 'ingress':
			// 	setIngressVisible(true);
		}
	};

	const onCreate = (values) => {
		console.log(values);
		if (type === 'monitor') {
			const sendData = {
				url: {
					clusterId: clusterId,
					componentName: 'monitor'
				},
				data: {
					monitor: {
						prometheus: {
							host: values['prometheus.host'],
							port: values['prometheus.port'],
							protocol: values['prometheus.protocol']
						},
						grafana: {
							host: values['grafana.host'],
							port: values['grafana.port'],
							protocol: values['grafana.protocol'],
							token: values['grafana.token']
						}
					}
				}
			};
			dockComponent(sendData).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '组件对接成功')
					);
					setMonitorVisible(false);
					window.location.reload();
				} else {
					Message.show(messageConfig('error', '失败', res));
					setMonitorVisible(false);
				}
			});
		} else if (type === 'backup') {
			const sendData = {
				url: {
					clusterId: clusterId,
					componentName: 'monitor'
				},
				data: {
					storage: {
						accessKeyId: values.accessKeyId,
						secretAccessKey: values.secretAccessKey,
						bucketName: values.bucketName,
						endpoint: values.endpoint,
						name: values.name
					}
				}
			};
			dockComponent(sendData).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '组件对接成功')
					);
					setBackupVisible(false);
					window.location.reload();
				} else {
					Message.show(messageConfig('error', '失败', res));
					setBackupVisible(false);
				}
			});
		}
		// else if( type === 'ingress'){
		// 	const sendData = {
		// 		url:{
		// 			clusterId:clusterId,
		// 			componentName:'monitor',
		// 		},
		// 		data:{
		// 			ingress: {
		// 				address: values.address,
		// 				tcp: {
		// 				  enabled: values.enabled,
		// 				  configMapName: values.configMapName,
		// 				  namespace: values.namespace
		// 				}
		// 			},
		// 		}
		// 	}
		// 	console.log(sendData);
		// 	dockComponent(sendData).then(res=>{
		// 		if(res.success){
		// 			Message.show(messageConfig('success','成功','组件对接成功'));
		// 		}else{
		// 			Message.show(messageConfig('error','失败',res));
		// 		}
		// 	})
		// }
	};

	const deployComponents = (values) => {
		if (type === 'monitor') {
			const sendData = {
				url: {
					clusterId: clusterId,
					componentName: 'monitor'
				},
				data: {
					monitor: {
						prometheus: {
							port: values['prometheus.port']
						},
						grafana: {
							port: values['grafana.port']
						}
					}
				}
			};
			deployComponent(sendData).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '组件部署成功')
					);
					setDeployMonitorVisible(false);
					window.location.reload();
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		} else if (type === 'backup') {
			const sendData = {
				url: {
					clusterId: clusterId,
					componentName: 'storageBackup'
				},
				data: {
					storage: {
						backup: {
							port: values.port
						}
					}
				}
			};
			deployComponent(sendData).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '组件部署成功')
					);
					setDeployBackupVisible(false);
					window.location.reload();
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
		// else if(type === 'ingress'){
		// 	deployComponent({clusterId:clusterId,componentName:'ingress'}).then(res=>{
		// 		if(res.success){
		// 			Message.show(messageConfig('success','成功','组件部署成功'));
		// 		}else{
		// 			Message.show(messageConfig('error','失败',res));
		// 		}
		// 	})
		// }
	};

	return (
		<div className="no-data-content">
			<img width={140} height={140} src={noData} />
			<p>组件未启用，请先部署/对接相应组件</p>
			<div className="no-data-button">
				<Button type="primary" onClick={handleDeployClick}>
					部署
				</Button>
				<Button type="normal" onClick={handleClick}>
					对接
				</Button>
			</div>
			{type === 'monitor' && monitorVisible === true && (
				<ResourceForm
					visible={monitorVisible}
					onCreate={onCreate}
					onCancel={() => setMonitorVisible(false)}
				/>
			)}
			{type === 'backup' && backupVisible === true && (
				<BackupForm
					visible={backupVisible}
					onCreate={onCreate}
					onCancel={() => setBackupVisible(false)}
				/>
			)}
			{/* {
				type === 'ingress' &&
				ingressVisible === true &&
				<IngressForm
					visible={ingressVisible}
					onCreate={onCreate}
					onCancel={() => setIngressVisible(false)}
				/>
			} */}
			{type === 'monitor' && deployMonitorVisible === true && (
				<DeployMonitorForm
					visible={deployMonitorVisible}
					onCancel={() => setDeployMonitorVisible(false)}
					onCreate={deployComponents}
				/>
			)}
			{type === 'backup' && deployBackupVisible === true && (
				<DeployBackupForm
					visible={deployBackupVisible}
					onCancel={() => setDeployBackupVisible(false)}
					onCreate={deployComponents}
				/>
			)}
		</div>
	);
}
