import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Table from '@/components/MidTable';
import {
	Button,
	Dialog,
	Message,
	Balloon,
	Icon
} from '@alicloud/console-components';
import { Page } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import AddServiceAvailableForm from '../ServiceAvailable/AddServiceAvailableForm';
import {
	getIngresses,
	deleteIngress,
	addIngress,
	getIngressMid
} from '@/services/ingress';
import messageConfig from '@/components/messageConfig';
import CustomIcon from '@/components/CustomIcon';
// import ComponentsLoading from '@/components/componentsLoading';
import './ingress.scss';

const instanceType = [
	{ value: 'mysql', label: 'MySQL' },
	{ value: 'redis', label: 'Redis' },
	{ value: 'elasticsearch', label: 'Elasticsearch' },
	{ value: 'rocketmq', label: 'RocketMQ' }
];
const exposedWay = [
	{ value: 'Ingress', label: 'Ingress' },
	{ value: 'NodePort', label: 'NodePort' }
];

function IngressList(props) {
	const { globalVar, entry = 'menu', type = '', middlewareName = '' } = props;
	const [dataSource, setDataSource] = useState([]);
	const [showDataSource, setShowDataSource] = useState([]);
	const [searchText, setSearchText] = useState('');
	const [active, setActive] = useState(false); // 抽屉显示
	const [iconVisible, setIconVisible] = useState(false);
	const [adress, setAdress] = useState('');
	useEffect(() => {
		if (
			JSON.stringify(globalVar.cluster) !== '{}' &&
			JSON.stringify(globalVar.namespace) !== '{}'
		) {
			entry !== 'detail'
				? getData(globalVar.cluster.id, globalVar.namespace.name)
				: getIngressByMid(
						globalVar.cluster.id,
						globalVar.namespace.name,
						type,
						middlewareName
				  );
		}
	}, [globalVar]);

	const getData = (clusterId, namespace, keyword = searchText) => {
		const sendData = {
			clusterId: clusterId,
			namespace: namespace,
			keyword: keyword
		};
		getIngresses(sendData).then((res) => {
			if (res.success) {
				setDataSource(res.data);
				setShowDataSource(res.data);
			}
		});
	};
	const getIngressByMid = (clusterId, namespace, type, middlewareName) => {
		const sendData = {
			clusterId,
			namespace,
			type,
			middlewareName
		};
		getIngressMid(sendData).then((res) => {
			if (res.success) {
				setShowDataSource(res.data);
				setDataSource(res.data);
			}
		});
	};

	const Operation = {
		primary: (
			<Button onClick={() => setActive(true)} type="primary">
				服务暴露
			</Button>
		)
	};

	const nameRender = (value, index, record) => {
		return (
			<>
				<div>{record.name}</div>
				<div
					className="name-link"
					onClick={() => console.log('todetail')}
				>
					{record.middlewareNickName}
				</div>
			</>
		);
	};

	const handleSearch = (value) => {
		setSearchText(value);
		getData(globalVar.cluster.id, globalVar.namespace.name, value);
	};
	const onFilter = (filterParams) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = dataSource.filter(
				(item) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
	};
	const handleDelete = (record) => {
		Dialog.show({
			title: '操作确认',
			content:
				'删除对外路由会影响当前正在通过对外地址访问中间件的服务，请确认执行',
			onOk: () => {
				const sendData = {
					...record,
					clusterId: globalVar.cluster.id,
					middlewareName: record.middlewareName,
					name: record.name,
					namespace: record.namespace
				};
				deleteIngress(sendData)
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig(
									'success',
									'成功',
									'对外路由删除成功'
								)
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						entry !== 'detail'
							? getData(
									globalVar.cluster.id,
									globalVar.namespace.name
							  )
							: getIngressByMid(
									globalVar.cluster.id,
									globalVar.namespace.name,
									type,
									middlewareName
							  );
					});
			}
		});
	};
	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton onClick={() => handleDelete(record)}>
					删除
				</LinkButton>
			</Actions>
		);
	};
	// * 浏览器复制到剪切板方法
	const copyValue = (value, record) => {
		const input = document.createElement('input');
		setAdress(record.name);
		setIconVisible(true);
		document.body.appendChild(input);
		input.style.position = 'absolute';
		input.style.top = '0px';
		input.style.opacity = '0';
		input.value = value;
		input.focus();
		input.select();
		if (document.execCommand('copy')) {
			document.execCommand('copy');
		}
		input.blur();
		document.body.removeChild(input);
		setTimeout(() => {
			setIconVisible(false);
		}, 3000);
		// Message.show(messageConfig('success', '成功', '复制成功'));
	};
	const addressRender = (value, index, record) => {
		if (record.protocol === 'HTTP') {
			const address = `${record.rules[0].domain}:${record.httpExposePort}${record.rules[0].ingressHttpPaths[0].path}`;
			return (
				<>
					<Balloon
						trigger={
							<CustomIcon
								type="icon-fuzhi"
								size="xs"
								style={{ color: '#0070CC', cursor: 'pointer' }}
								onClick={() => copyValue(address, record)}
							/>
						}
						triggerType={'click'}
						closable={false}
						visible={iconVisible && adress === record.name}
					>
						<Icon
							type={'success'}
							style={{ color: '#00A700', marginRight: '5px' }}
							size={'xs'}
						/>
						复制成功
					</Balloon>
					{address}
				</>
			);
		} else {
			return (
				<div className="ingress-balloon-content">
					<div className="ingress-balloon-list-content">
						{record.serviceList &&
							record.serviceList.map((item, index) => {
								const address = `${record.exposeIP}:${item.exposePort}`;
								if (index > 1) {
									return null;
								}
								return (
									<div key={index}>
										<Balloon
											trigger={
												<CustomIcon
													type="icon-fuzhi"
													size="xs"
													style={{
														color: '#0070CC',
														cursor: 'pointer'
													}}
													onClick={() =>
														copyValue(
															address,
															record
														)
													}
												/>
											}
											triggerType={'click'}
											closable={false}
											visible={
												iconVisible &&
												adress === record.name
											}
										>
											<Icon
												type={'success'}
												style={{
													color: '#00A700',
													marginRight: '5px'
												}}
												size={'xs'}
											/>
											复制成功
										</Balloon>
										{address}
									</div>
								);
							})}
					</div>
					{record.serviceList.length > 2 && (
						<Balloon
							trigger={
								<span className="tips-more">
									<Icon size="xs" type="ellipsis" />
								</span>
							}
							closable={false}
						>
							{record.serviceList.map((item, index) => {
								const address = `${record.exposeIP}:${item.exposePort}`;
								return (
									<div key={index} className="balloon-tips">
										<Balloon
											trigger={
												<CustomIcon
													type="icon-fuzhi"
													size="xs"
													style={{
														color: '#0070CC',
														cursor: 'pointer'
													}}
													onClick={() =>
														copyValue(
															address,
															record
														)
													}
												/>
											}
											triggerType={'click'}
											closable={false}
											visible={
												iconVisible &&
												adress === record.name
											}
										>
											<Icon
												type={'success'}
												style={{
													color: '#00A700',
													marginRight: '5px'
												}}
												size={'xs'}
											/>
											复制成功
										</Balloon>
										{address}
									</div>
								);
							})}
						</Balloon>
					)}
				</div>
			);
		}
	};
	const portRender = (value, index, record) => {
		const port =
			record.protocol === 'HTTP'
				? record.rules[0].ingressHttpPaths[0].servicePort
				: record.serviceList[0].servicePort;
		return <span>{port}</span>;
	};
	const onCreate = (values) => {
		const sendData =
			values.protocol === 'HTTP'
				? {
						clusterId: globalVar.cluster.id,
						namespace: globalVar.namespace.name,
						exposeType: values.exposeType,
						middlewareName: values.selectedInstance.name,
						middlewareType: values.selectedInstance.type,
						protocol: values.protocol,
						ingressClassName: values.ingressClassName,
						rules: [
							{
								domain: values.domain,
								ingressHttpPaths: [
									{
										path: values.path,
										serviceName: values.serviceName,
										servicePort: values.servicePort
									}
								]
							}
						]
				  }
				: {
						clusterId: globalVar.cluster.id,
						namespace: globalVar.namespace.name,
						exposeType: values.exposeType,
						middlewareName: values.selectedInstance.name,
						middlewareType: values.selectedInstance.type,
						protocol: values.protocol,
						ingressClassName: values.ingressClassName,
						serviceList: [
							{
								exposePort: values.exposePort,
								serviceName: values.serviceName,
								servicePort: values.servicePort,
								targetPort:
									values.selectedService.portDetailDtoList[0]
										.targetPort
							}
						]
				  };
		addIngress(sendData).then((res) => {
			if (res.success) {
				Message.show(
					messageConfig('success', '成功', '对外路由添加成功')
				);
				setActive(false);
				getIngressByMid(
					globalVar.cluster.id,
					globalVar.namespace.name,
					type,
					middlewareName
				);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const exposeTypeRender = (value, index, record) => {
		return `${record.exposeType}/${record.ingressClassName || '-'}`;
	};

	return (
		<Page>
			{entry !== 'detail' ? (
				<Page.Header title="对外路由"></Page.Header>
			) : null}
			<Page.Content
				style={entry !== 'detail' ? {} : { padding: '0 0', margin: 0 }}
			>
				<Table
					dataSource={showDataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					showColumnSetting
					showRefresh
					onRefresh={() =>
						entry !== 'detail'
							? getData(
									globalVar.cluster.id,
									globalVar.namespace.name
							  )
							: getIngressByMid(
									globalVar.cluster.id,
									globalVar.namespace.name,
									type,
									middlewareName
							  )
					}
					primaryKey="key"
					operation={Operation}
					search={
						entry === 'detail'
							? null
							: {
									onSearch: handleSearch,
									placeholder: '请输入搜索内容'
							  }
					}
					onFilter={entry === 'detail' ? null : onFilter}
				>
					<Table.Column
						title="路由名称/映射名称"
						dataIndex="ingressName"
						width={220}
						cell={nameRender}
					/>
					<Table.Column
						title="服务类型"
						dataIndex="middlewareType"
						filters={entry === 'detail' ? null : instanceType}
						filterMode="single"
						width={150}
					/>
					<Table.Column
						title="暴露方式"
						dataIndex="exposeType"
						filters={entry === 'detail' ? null : exposedWay}
						filterMode="single"
						width={200}
						cell={exposeTypeRender}
					/>
					<Table.Column
						title="协议"
						dataIndex="protocol"
						width={100}
					/>
					<Table.Column
						title="访问地址"
						cell={addressRender}
						width={200}
					/>
					<Table.Column
						title="服务端口"
						dataIndex="httpExposePort"
						cell={portRender}
						width={100}
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
						width={150}
						lock="right"
					/>
				</Table>
			</Page.Content>
			{active && (
				<AddServiceAvailableForm
					visible={active}
					onCreate={onCreate}
					onCancel={() => setActive(false)}
					cluster={globalVar.cluster}
					namespace={globalVar.namespace.name}
					middlewareName={middlewareName}
				/>
			)}
		</Page>
	);
}
export default connect(
	({ globalVar }) => ({
		globalVar
	}),
	null
)(IngressList);
