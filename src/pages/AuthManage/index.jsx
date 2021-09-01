import React, { useState, useEffect } from 'react';
import { Button } from '@alicloud/console-components';
import Card from './card';
import ModifyLicense from './modifyLicense';
import { getLicense } from '@/services/user';

import styles from './authManage.module.scss';
import iconResource from '@/assets/images/icon-resource.svg';

export default function AuthManage() {
	const [visible, setVisible] = useState(false);
	const [license, setLicense] = useState('');
	const [middlewareList, setMiddlewareList] = useState([]);

	const updateHandle = () => {
		setVisible(true);
	};

	const getLicenseInfo = async () => {
		let res = await getLicense();
		if (res.success) {
			setLicense(res.data.license);
			setMiddlewareList(res.data.middleList);
		}
	};

	useEffect(() => {
		getLicenseInfo();
	}, []);

	return (
		<>
			<div className={`display-flex ${styles['license-wrapper']}`}>
				<img src={iconResource} width="90" />
				<div className={`display-flex ${styles['license-intro']}`}>
					<h2>授权管理</h2>
					<p>通过激活license获得中间件的授权实例数</p>
					<Button type="primary" onClick={updateHandle}>
						更新授权
					</Button>
				</div>
			</div>
			<div className={`display-flex ${styles['middleware-list']}`}>
				{middlewareList.map((item, index) => (
					<Card key={index} middleware={item} />
				))}
			</div>
			{visible && (
				<ModifyLicense
					visible={visible}
					license={license}
					cancelHandle={() => setVisible(false)}
					updateList={() => getLicenseInfo()}
				/>
			)}
		</>
	);
}
