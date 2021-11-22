import React, { useEffect, useState } from 'react';
import { Message } from '@alicloud/console-components';
import { getMiddlewareMonitorUrl } from '@/services/middleware.js';
import ComponentsLoading from '@/components/componentsLoading';
import messageConfig from '@/components/messageConfig';
import DefaultPicture from '@/components/DefaultPicture';

import styles from './monitor.module.scss';
import svg from '@/assets/images/grafana_icon.svg';

const Monitor = (props) => {
	const {
		clusterId,
		namespace,
		middlewareName,
		type,
		monitor,
		customMid,
		capabilities,
		chartVersion
	} = props;
	const [url, setUrl] = useState('');
	const [token, setToken] = useState('');
	const [menuHide, setMenuHide] = useState(false);
	console.log(props);
	useEffect(() => {
		if (!customMid || capabilities.includes('monitoring')) {
			if (type && monitor) {
				getMiddlewareMonitorUrl({
					clusterId,
					namespace,
					middlewareName,
					type,
					chartVersion
				}).then((res) => {
					if (res.success) {
						setUrl(res.data.url);
						// setUrl(`${res.data.url}?auth_token=${res.data.authorization}`);
						// setToken(res.data.authorization);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		}
	}, [props.chartVersion]);

	useEffect(() => {
		if (url) {
			console.log(url);
			// console.log(token);
			let iframe = document.getElementById('iframe');
			let iframeDocument =
				document.getElementsByTagName('iframe')[0].contentDocument;
			console.log(iframeDocument);
			iframe.onload = function () {
				// iframe.contentWindow.init(token);
				console.log(iframeDocument);
				// document.domain = 'http://10.1.30.70:31900';
				document.cookie =
					'grafana_session=247db337806bd10b81bc5fc77681f67b; SameSite=None; Secure; Domain=10.1.30.70;';
				// iframeDocument.cookie =
				// 	'grafana_session=247db337806bd10b81bc5fc77681f67b; SameSite=None; Secure; domain=http://10.1.30.70:31900';
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

	return (
		<div className={styles['monitor']}>
			{monitor.grafana === null ? (
				<ComponentsLoading type="monitor" />
			) : (
				<>
					<div
						style={{
							height: '100%',
							visibility: menuHide ? 'visible' : 'hidden'
						}}
					>
						{url && (
							<iframe
								id="iframe"
								src={url}
								frameBorder="no"
								border="0"
								scrolling="no"
								// referrerPolicy="origin-when-cross-origin"
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
				</>
			)}
		</div>
	);
};

export default Monitor;
