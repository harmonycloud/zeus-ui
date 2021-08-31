import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Dialog, Message } from '@alicloud/console-components';
import { Icon } from '@alifd/next';
import { getNamespaces, putNamespaces } from '@/services/common.js';
import MidTable from '@/components/MidTable/index';
import messageConfig from '@/components/messageConfig';
import { setRefreshCluster } from '@/redux/globalVar/var';

import styles from './basicResource.module.scss';

const RegistryNamespace = (props) => {
	const {
		visible,
		clusterId,
		updateFn,
		cancelHandle,
		setRefreshCluster
	} = props;
	const [dataSource, setDataSource] = useState([]);
	const [originDataSource, setOriginDataSource] = useState([]);
	const [primaryKeys, setPrimaryKeys] = useState([]);

	const handleSearch = (value) => {
		let tempArr = originDataSource.filter((item) => {
			if (item.name.indexOf(value) > -1) return true;
		});
		setDataSource(tempArr);
	};
	const onChange = (selectedRowKeys) => {
		setPrimaryKeys(selectedRowKeys);
	};
	const okHandle = () => {
		let nsArray = [];
		dataSource.forEach((namespace) => {
			primaryKeys.forEach((id) => {
				if (id === namespace.id) {
					nsArray.push(namespace.name);
				}
			});
		});
		putNamespaces({ clusterId }, nsArray).then((res) => {
			if (res.success) {
				Message.show(
					messageConfig('success', '成功', {
						data: '分区注册更新成功'
					})
				);
				cancelHandle();
				updateFn();
				setRefreshCluster(true);
			} else {
				Message.show(messageConfig('error', '错误', res));
			}
		});
	};

	useEffect(() => {
		if (clusterId) {
			getNamespaces({
				clusterId,
				all: true,
				withQuota: true,
				withMiddleware: true
			}).then((res) => {
				console.log(res);
				if (res.success) {
					let temp = res.data.map((item, index) => ({
						...item,
						id: index,
						middlewareReplicas: item.middlewareReplicas
							? item.middlewareReplicas
							: 0,
						cpu: item.quotas
							? `${item.quotas.cpu[2]}/${item.quotas.cpu[1]} Core`
							: '未限制',
						memory: item.quotas
							? `${item.quotas.memory[2]}/${item.quotas.memory[1]} GB`
							: '未限制'
					}));
					setDataSource(temp);
					setOriginDataSource(temp);
					let keys = [];
					temp.forEach((item) => {
						if (item.registered) keys.push(item.id);
					});
					setPrimaryKeys(keys);
				}
			});
		}
	}, [clusterId]);

	return (
		<Dialog
			title="注册命名空间"
			visible={visible}
			style={{ width: 640 }}
			footerAlign="right"
			onOk={okHandle}
			onCancel={cancelHandle}
			onClose={cancelHandle}
			isFullScreen={true}
		>
			<div className={styles['registry-namespace']}>
				<div className={styles['tips-yellow']}>
					<Icon
						type="warning"
						size="xs"
						style={{ color: '#FAC800' }}
					/>
					<span>中间件实例数不为0时不能取消勾选</span>
				</div>
				<div className={styles['namespace-table']}>
					<MidTable
						dataSource={dataSource}
						exact
						search={{
							onSearch: handleSearch,
							placeholder: '请输入搜索内容'
						}}
						rowSelection={{
							onChange,
							selectedRowKeys: primaryKeys
						}}
						showJump={false}
					>
						<MidTable.Column
							title="命名空间名称"
							dataIndex="name"
						/>
						<MidTable.Column
							title="中间件实例数"
							dataIndex="middlewareReplicas"
						/>
						<MidTable.Column title="CPU配额" dataIndex="cpu" />
						<MidTable.Column title="内存配额" dataIndex="memory" />
					</MidTable>
				</div>
			</div>
		</Dialog>
	);
};

export default connect(() => ({}), { setRefreshCluster })(RegistryNamespace);
