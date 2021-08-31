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
import AddIngress from './addIngress';
import {
	getIngresses,
	deleteIngress,
	addIngress,
	getIngressMid
} from '@/services/ingress';
import messageConfig from '@/components/messageConfig';
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
				添加路由
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
			},
			onCancel: () => {}
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
	const copyValue = (value) => {
		let input = document.createElement('input');
		document.body.appendChild(input);
		input.style.position = 'absolute';
		input.style.top = 0;
		input.style.opacity = 0;
		input.value = value;
		input.focus();
		input.select();
		if (document.execCommand('copy')) {
			document.execCommand('copy');
		}
		input.blur();
		document.body.removeChild(input);
		Message.show(messageConfig('success', '成功', '复制成功'));
	};
	const addressRender = (value, index, record) => {
		if (record.protocol === 'HTTP') {
			const address = `${record.rules[0].domain}:${record.httpExposePort}${record.rules[0].ingressHttpPaths[0].path}`;
			return (
				<>
					{address}
					<span
						className="name-link"
						style={{ marginLeft: 12 }}
						onClick={() => copyValue(address)}
					>
						复制
					</span>
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
										{address}
										<span
											className="name-link"
											style={{ marginLeft: 12 }}
											onClick={() => copyValue(address)}
										>
											复制
										</span>
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
										{address}
										<span
											className="name-link"
											style={{ marginLeft: 12 }}
											onClick={() => copyValue(address)}
										>
											复制
										</span>
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
						middlewareName: values.middlewareName,
						middlewareType: values.selectedInstance.type,
						protocol: values.protocol,
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
						middlewareName: values.middlewareName,
						middlewareType: values.selectedInstance.type,
						protocol: values.protocol,
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
				entry !== 'detail'
					? getData(globalVar.cluster.id, globalVar.namespace.name)
					: getIngressByMid(
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

	const onCancel = () => {
		setActive(false);
	};

	return (
		<Page>
			{entry !== 'detail' ? (
				<Page.Header title="对外路由"></Page.Header>
			) : null}
			<Page.Content style={entry !== 'detail' ? {} : { padding: '0 0' }}>
				<div className="header-tips">
					对外路由功能说明
					<br />
					基于平台内置的负载均衡器，可创建对外访问的规则，使平台创建的中间件可以提供对外访问入口，详情参加
					<span
						className="name-link"
						onClick={() =>
							window.open(
								'https://www.yuque.com/fiidi3/to4o93/nqgkpf',
								'_blank'
							)
						}
					>
						《中间件对外访问配置说明》
					</span>
				</div>
				{/* {
					globalVar.cluster.ingress ? */}
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
						resizable
						cell={nameRender}
					/>
					<Table.Column
						title="实例类型"
						dataIndex="middlewareType"
						filters={entry === 'detail' ? null : instanceType}
						filterMode="single"
					/>
					<Table.Column
						title="暴露方式"
						dataIndex="exposeType"
						filters={entry === 'detail' ? null : exposedWay}
						filterMode="single"
					/>
					<Table.Column title="协议" dataIndex="protocol" />
					<Table.Column title="访问地址" cell={addressRender} />
					<Table.Column
						title="实例端口"
						dataIndex="httpExposePort"
						cell={portRender}
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
						width={188}
						lock="right"
					/>
				</Table>
				{/* :
					<ComponentsLoading type="ingress" />
				} */}
			</Page.Content>
			{active && (
				<AddIngress
					active={active}
					onCreate={onCreate}
					onCancel={onCancel}
					entry={entry}
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
