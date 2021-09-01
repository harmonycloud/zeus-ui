import React, { useState, useEffect } from 'react';
import Page from '@alicloud/console-components-page';
import { Button } from '@alicloud/console-components';
import { connect } from 'react-redux';
import Card from './components/Card/card';
import UploadMiddlewareForm from './components/UploadMiddlewareForm';
import styles from './service.module.scss';
import { getMiddlewares } from '@/services/middleware.js';

const ServiceCatalog = (props) => {
	const { cluster: globalCluster } = props.globalVar;
	const [mdList, setMdList] = useState([]);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (JSON.stringify(globalCluster) !== '{}') {
			middlewareList(globalCluster.id);
		}
		return () => {};
	}, [globalCluster]);

	async function middlewareList(clusterId) {
		let res = await getMiddlewares({ clusterId });
		if (res.success) {
			setMdList(res.data);
		}
	}

	const onCreate = () => {
		setVisible(false);
		middlewareList(globalCluster.id);
	};

	return (
		<Page>
			<Page.Header title="服务目录" />
			<Page.Content>
				<div style={{ padding: '0 0 14px 10px' }}>
					<Button type="primary" onClick={() => setVisible(true)}>
						中间件上架
					</Button>
				</div>
				<div className={styles['service-catalog']}>
					<div className={styles['list']}>
						{mdList.map((item, index) => {
							return <Card key={index} card={item} />;
						})}
					</div>
				</div>
			</Page.Content>
			{visible && (
				<UploadMiddlewareForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onCreate={onCreate}
				/>
			)}
		</Page>
	);
};

export default connect(({ globalVar }) => ({ globalVar }), {})(ServiceCatalog);
