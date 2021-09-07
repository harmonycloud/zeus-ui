import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
	Button,
	Message,
	Dialog,
	Checkbox,
	Balloon,
	Icon
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import RapidScreening from '@/components/RapidScreening';
import messageConfig from '@/components/messageConfig';
import { serviceListStatusRender } from '@/utils/utils';
import { exposedWay } from '@/utils/const';
import { StoreState } from '@/types/index';

const list = [
	{ name: '全部服务', count: 1000 },
	{ name: 'mysql', count: 100 },
	{ name: 'raocketmq', count: 100 },
	{ name: 'redis', count: 100 }
];
export default function ServiceAvailable() {
	const [selected, setSelected] = useState<string>('全部服务');
	const [originData, setOriginData] = useState([]);
	const [dataSource, setDataSource] = useState([]);
	const [active, setActive] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>('');
	const handleSearch = (value: string) => {
		setSearchText(value);
		// getData(globalVar.cluster.id, globalVar.namespace.name, value);
	};
	const onFilter = (filterParams: any) => {
		console.log(filterParams);
		// const keys = Object.keys(filterParams);
		// if (filterParams[keys[0]].selectedKeys.length > 0) {
		// 	const list = dataSource.filter(
		// 		(item) =>
		// 			item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
		// 	);
		// 	setShowDataSource(list);
		// } else {
		// 	setShowDataSource(dataSource);
		// }
	};
	const handleDelete = (record: any) => {
		console.log('delete record', record);
		// Dialog.show({
		// 	title: '操作确认',
		// 	content:
		// 		'删除对外路由会影响当前正在通过对外地址访问中间件的服务，请确认执行',
		// 	onOk: () => {
		// 		const sendData = {
		// 			...record,
		// 			clusterId: globalVar.cluster.id,
		// 			middlewareName: record.middlewareName,
		// 			name: record.name,
		// 			namespace: record.namespace
		// 		};
		// 		deleteIngress(sendData)
		// 			.then((res) => {
		// 				if (res.success) {
		// 					Message.show(
		// 						messageConfig(
		// 							'success',
		// 							'成功',
		// 							'对外路由删除成功'
		// 						)
		// 					);
		// 				} else {
		// 					Message.show(messageConfig('error', '失败', res));
		// 				}
		// 			})
		// 			.finally(() => {
		// 				entry !== 'detail'
		// 					? getData(
		// 							globalVar.cluster.id,
		// 							globalVar.namespace.name
		// 					  )
		// 					: getIngressByMid(
		// 							globalVar.cluster.id,
		// 							globalVar.namespace.name,
		// 							type,
		// 							middlewareName
		// 					  );
		// 			});
		// 	}
		// });
	};
	const Operation = {
		primary: (
			<Button onClick={() => setActive(true)} type="primary">
				暴露服务
			</Button>
		)
	};
	const nameRender = (value: string, index: number, record: any) => {
		return (
			<>
				<div>{record.name}</div>
				<div
					className="name-link"
					onClick={() => console.log('to detail')}
				>
					{record.middlewareNickName}
				</div>
			</>
		);
	};
	// * 浏览器复制到剪切板方法
	const copyValue = (value: any) => {
		const input = document.createElement('input');
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
		Message.show(messageConfig('success', '成功', '复制成功'));
	};
	const addressRender = (value: string, index: number, record: any) => {
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
							record.serviceList.map(
								(item: any, index: number) => {
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
												onClick={() =>
													copyValue(address)
												}
											>
												复制
											</span>
										</div>
									);
								}
							)}
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
							{record.serviceList.map(
								(item: any, index: number) => {
									const address = `${record.exposeIP}:${item.exposePort}`;
									return (
										<div
											key={index}
											className="balloon-tips"
										>
											{address}
											<span
												className="name-link"
												style={{ marginLeft: 12 }}
												onClick={() =>
													copyValue(address)
												}
											>
												复制
											</span>
										</div>
									);
								}
							)}
						</Balloon>
					)}
				</div>
			);
		}
	};
	const portRender = (value: string, index: number, record: any) => {
		const port =
			record.protocol === 'HTTP'
				? record.rules[0].ingressHttpPaths[0].servicePort
				: record.serviceList[0].servicePort;
		return <span>{port}</span>;
	};
	const actionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				<LinkButton onClick={() => handleDelete(record)}>
					删除
				</LinkButton>
			</Actions>
		);
	};
	return (
		<Page>
			<Header
				title="服务暴露"
				subTitle="通过Nginx-Ingress/NodePort等多种方式对外暴露已发布的不同类型中间件服务"
			/>
			<Content>
				<RapidScreening
					list={list}
					selected={selected}
					changeSelected={(value: string) => setSelected(value)}
				/>
				<Table
					dataSource={dataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					showColumnSetting
					showRefresh
					onRefresh={() => console.log('refresh data')}
					primaryKey="key"
					operation={Operation}
					search={{
						onSearch: handleSearch,
						placeholder: '请输入搜索内容'
					}}
					onFilter={onFilter}
				>
					<Table.Column
						title="路由名称/映射名称"
						dataIndex="ingressName"
						resizable
						cell={nameRender}
					/>
					<Table.Column title="服务类型" dataIndex="middlewareType" />
					<Table.Column
						title="暴露方式"
						dataIndex="exposeType"
						filters={exposedWay}
						filterMode="single"
					/>
					<Table.Column title="协议" dataIndex="protocol" />
					<Table.Column title="访问地址" cell={addressRender} />
					<Table.Column
						title="服务端口"
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
			</Content>
		</Page>
	);
}
