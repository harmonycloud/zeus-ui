import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getMiddlewareMonitorUrl } from '@/services/middleware';
import DefaultPicture from '@/components/DefaultPicture';
import ComponentNull from '@/components/ComponentsNull';

import svg from '@/assets/images/grafana_icon.svg';
import { MonitorProps } from '../detail';
import styles from './monitor.module.scss';

const Monitor = (props: MonitorProps) => {
	const {
		clusterId,
		namespace,
		middlewareName,
		type,
		grafanaOpen,
		customMid,
		capabilities,
		chartVersion
	} = props;
	const [url, setUrl] = useState('');
	const [menuHide, setMenuHide] = useState(false);
	useEffect(() => {
		if (!customMid || capabilities.includes('monitoring')) {
			if (type && grafanaOpen) {
				if (chartVersion && clusterId && namespace) {
					getMiddlewareMonitorUrl({
						clusterId,
						namespace,
						middlewareName,
						type,
						chartVersion
					}).then((res) => {
						if (res.success) {
							setUrl(res.data.url);
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					});
				}
			}
		}
	}, [namespace, clusterId, chartVersion]);

	useEffect(() => {
		if (url) {
			const iframe: any = document.getElementById('iframe');
			iframe.onload = function () {
				iframe.contentWindow.postMessage({ showMenu: false }, '*');
			};
		}
	}, [url]);

	useEffect(() => {
		// 子页面去掉侧边栏之后再显示iframe
		window.addEventListener(
			'message',
			function (event) {
				if (event.data.menuHide) {
					setMenuHide(true);
				}
			},
			false
		);
	});

	if (customMid && !capabilities.includes('monitoring')) {
		return <DefaultPicture />;
	}
	if (!grafanaOpen) {
		return (
			<ComponentNull title="该功能所需要数据监控和监控面板工具支持，您可前往“集群——>平台组件进行安装" />
		);
	}

	return (
		<div className={styles['monitor']}>
			<div
				style={{
					height: 'calc(100vh - 83px)',
					visibility: menuHide ? 'visible' : 'hidden'
				}}
			>
				{url && (
					<iframe
						id="iframe"
						src={url}
						frameBorder="no"
						// border="0"
						scrolling="no"
						style={{
							width: '100%',
							height: '100%',
							background: '#FFF'
						}}
					></iframe>
				)}
			</div>
			<div
				className={styles['loading-gif']}
				style={{
					visibility: menuHide ? 'hidden' : 'visible'
				}}
			>
				<div className={styles['loading-icon']}>
					<img src={svg} width="60" />
				</div>
			</div>
		</div>
	);
};

export default Monitor;
