import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { ProHeader, ProPage, ProContent } from '@/components/ProPage';
import ProTable from '@/components/ProTable';
import { connect } from 'react-redux';
import { deleteIngress, getIngresses } from '@/services/ingress';
import { StoreState } from '@/types';
import { ServiceIngressProps, ServiceIngressItem } from './serviceIngress';
import GuidePage from '../GuidePage';
import Actions from '@/components/Actions';
import { Drawer, Modal, notification, Table } from 'antd';
import { FiltersProps } from '@/types/comment';
import { api } from '@/api.json';
import nodata from '@/assets/images/nodata.svg';
import storage from '@/utils/storage';
import { objectRemoveDuplicatesByKey } from '@/utils/utils';

const LinkButton = Actions.LinkButton;
function ServiceIngress(props: ServiceIngressProps): JSX.Element {
	const { cluster, namespace, project } = props.globalVar;
	const history = useHistory();
	const [searchText, setSearchText] = useState<string>('');
	const [dataSource, setDataSource] = useState<ServiceIngressItem[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [curIngress, setCurIngress] = useState<ServiceIngressItem>();
	const [typeFilter, setTypeFilter] = useState<FiltersProps[]>([]);
	useEffect(() => {
		let mounted = true;
		if (
			JSON.stringify(cluster) !== '{}' &&
			JSON.stringify(namespace) !== '{}'
		) {
			if (mounted) {
				getIngresses({
					clusterId: cluster.id,
					namespace: namespace.name,
					keyword: searchText
				}).then((res) => {
					if (res.success) {
						setDataSource(res.data);
						const list = res.data.map(
							(item: ServiceIngressItem) => {
								return {
									value: item.middlewareType,
									text: item.middlewareType
								};
							}
						);

						setTypeFilter(
							objectRemoveDuplicatesByKey(list, 'value')
						);
					}
				});
			}
		}
		return () => {
			mounted = false;
		};
	}, [cluster, namespace]);
	const getData = (keyword?: string) => {
		getIngresses({
			clusterId: cluster.id,
			namespace: namespace.name,
			keyword: keyword || ''
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			}
		});
	};
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(event.target.value);
	};
	const handleSearch = (value: string) => {
		getData(value);
	};
	const handleDelete = (record: ServiceIngressItem) => {
		Modal.confirm({
			title: '操作确认',
			content:
				'删除对外路由会影响当前正在通过对外地址访问中间件的服务，请确认执行',
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				const sendData = {
					...record,
					clusterId: cluster.id,
					middlewareName: record.middlewareName,
					name: record.name,
					namespace: record.namespace
				};
				return deleteIngress(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '对外路由删除成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						getData(searchText);
					});
			}
		});
	};
	const actionRender = (_: string, record: ServiceIngressItem) => {
		return (
			<Actions>
				{record.exposeType === 'Ingress' && record.protocol === 'TCP' && (
					<LinkButton
						onClick={() => {
							setCurIngress(record);
							setVisible(true);
						}}
					>
						查看详情
					</LinkButton>
				)}
				<LinkButton
					title={
						judgeInit(record)
							? '该服务暴露为集群外访问，无法删除。'
							: ''
					}
					disabled={judgeInit(record)}
					onClick={() => handleDelete(record)}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	const ipRender = (value: string, record: ServiceIngressItem) => {
		if (record.exposeType === 'NodePort') return record.exposeIP;
		if (record.protocol === 'HTTP') return record.rules?.[0].domain;
		if (record.exposeType === 'Ingress')
			return record.serviceList?.[0].exposePort;
	};
	const exposeTypeRender = (value: string, record: ServiceIngressItem) => {
		if (record.exposeType === 'Ingress') return record.protocol;
		return record.exposeType;
	};
	const nameRender = (value: string, record: ServiceIngressItem) => {
		return record.servicePurpose;
	};
	const judgeInit = (record: any) => {
		if (
			record.middlewareType === 'rocketmq' ||
			record.middlewareType === 'kafka'
		) {
			const initService = [
				`${record.middlewareName}-0-master`,
				`${record.middlewareName}-1-master`,
				`${record.middlewareName}-2-master`,
				`${record.middlewareName}-nameserver-proxy-svc`
			];
			if (record.middlewareType === 'rocketmq') {
				return initService.some((item) => record.name.includes(item));
			} else {
				if (
					record.name.includes(
						`${record.serviceName}-kafka-external-svc`
					)
				) {
					return true;
				} else {
					return false;
				}
			}
		} else {
			return false;
		}
	};

	if (JSON.stringify(cluster) === '{}' || JSON.stringify(project) === '{}') {
		return <GuidePage />;
	}
	return (
		<ProPage>
			<ProHeader
				title="服务暴露"
				subTitle="通过Nginx-Ingress/NodePort等多种方式对外暴露已发布的不同类型中间件服务"
			/>
			<ProContent>
				<ProTable
					rowKey="name"
					dataSource={dataSource}
					search={{
						value: searchText,
						onChange: handleChange,
						onSearch: handleSearch,
						placeholder: '请输入服务名称、暴露服务搜索',
						style: { width: '350px' }
					}}
				>
					<ProTable.Column
						dataIndex="middlewareName"
						title="服务名称"
					/>
					<ProTable.Column
						dataIndex="middlewareType"
						title="服务类型"
						filters={typeFilter}
						onFilter={(value: any, record: ServiceIngressItem) =>
							record.middlewareType === value
						}
					/>
					<ProTable.Column
						dataIndex="exposeType"
						title="暴露方式"
						render={exposeTypeRender}
						filters={[
							{ value: 'NodePort', text: 'NodePort' },
							{ value: 'HTTP', text: 'HTTP' },
							{ value: 'TCP', text: 'TCP' }
						]}
						onFilter={(value: any, record: ServiceIngressItem) => {
							if (record.exposeType === 'Ingress')
								return record.protocol === value;
							return record.exposeType === value;
						}}
					/>
					<ProTable.Column
						dataIndex="name"
						title="暴露服务"
						render={nameRender}
					/>
					<ProTable.Column
						dataIndex="ip"
						title="暴露IP/域名/端口"
						render={ipRender}
					/>
					<ProTable.Column
						dataIndex="action"
						title="操作"
						render={actionRender}
					/>
				</ProTable>
				<Drawer
					title={
						<div className="icon-type-content">
							<img
								width={14}
								height={14}
								src={
									curIngress?.imagePath
										? `${api}/images/middleware/${curIngress?.imagePath}`
										: nodata
								}
							/>
							<div style={{ marginLeft: 8 }}>
								{curIngress?.middlewareNickName ||
									curIngress?.middlewareName}
							</div>
						</div>
					}
					placement="right"
					onClose={() => setVisible(false)}
					visible={visible}
					width={500}
				>
					<Table dataSource={curIngress?.ingressPodList || []}>
						<Table.Column dataIndex="podIp" title="IP" />
						<Table.Column dataIndex="podName" title="Ingress名称" />
					</Table>
				</Drawer>
			</ProContent>
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(ServiceIngress);
