import React, { useEffect, useState } from 'react';
import { Modal, Button, notification, Alert } from 'antd';

import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import moment from 'moment';

import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import UploadMiddlewareForm from '../ServiceCatalog/components/UploadMiddlewareForm';

import {
	getTypeVersion,
	updateMiddleware,
	shelvesTypeVersion
} from '@/services/repository';
import { middlewareRepositoryProps, paramsProps } from './middleware';
import { setMenuRefresh } from '@/redux/menu/menu';
import { getMiddlewareRepository } from '@/services/repository';

import { middlewareProps } from './middleware';
import { iconTypeRender } from '@/utils/utils';
import { versionStatus } from '@/utils/enum';
import { StoreState } from '@/types/index';

import './index.scss';

const LinkButton = Actions.LinkButton;
function MiddlewareVersion(props: middlewareRepositoryProps): JSX.Element {
	const {
		globalVar: { cluster, namespace },
		setMenuRefresh
	} = props;
	const params: paramsProps = useParams();
	const [originData, setOriginData] = useState<middlewareProps[]>([]);
	const [dataSource, setDataSource] = useState<middlewareProps[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(cluster) !== '{}') {
			getTypeVersion({
				clusterId: params.clusterId,
				type: params.type
			}).then((res) => {
				if (res.success) {
					if (mounted) {
						setOriginData(res.data);
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
		return () => {
			mounted = false;
		};
	}, [props]);
	const getData = () => {
		getMiddlewareRepository({
			clusterId: params.clusterId,
			namespace: namespace.name
		});
		getTypeVersion({
			clusterId: params.clusterId,
			type: params.type
		}).then((res) => {
			if (res.success) {
				setOriginData(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	useEffect(() => {
		setDataSource([...originData]);
	}, [originData]);
	const onCreate = () => {
		setVisible(false);
		getData();
	};
	const Operation = {
		primary: (
			<Button onClick={() => setVisible(true)} type="primary">
				上架新版本
			</Button>
		)
	};
	// const onFilter = (filterParams: any) => {
	// 	const keys = Object.keys(filterParams);
	// 	if (filterParams[keys[0]].selectedKeys.length > 0) {
	// 		const list = originData.filter(
	// 			(item) =>
	// 				item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
	// 		);
	// 		setDataSource(list);
	// 	} else {
	// 		setDataSource(originData);
	// 	}
	// };
	// const onSort = (dataIndex: string, order: string) => {
	// 	if (dataIndex === 'createTime') {
	// 		const dsTemp = originData.sort((a, b) => {
	// 			const result =
	// 				moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
	// 			return order === 'asc'
	// 				? result > 0
	// 					? 1
	// 					: -1
	// 				: result > 0
	// 				? -1
	// 				: 1;
	// 		});
	// 		setDataSource([...dsTemp]);
	// 	}
	// };
	const versionStatusRender = (value: string) => {
		const color =
			value === 'now'
				? '#00A7FA'
				: value === 'future' || value === 'updating'
				? '#52C41A'
				: '#666666';
		const bgColor =
			value === 'now'
				? '#EBF8FF'
				: value === 'future' || value === 'updating'
				? '#F6FFED'
				: '#F5F5F5';
		return (
			<div
				className="version-status-display"
				style={{
					color: color,
					backgroundColor: bgColor,
					borderColor: color
				}}
			>
				{versionStatus[value]}
			</div>
		);
	};
	const actionRender = (
		value: string,
		record: middlewareProps,
		index: number
	) => {
		return (
			<Actions>
				{record.versionStatus === 'future' && (
					<LinkButton onClick={() => installUpdate(record)}>
						安装升级
					</LinkButton>
				)}
				{record.versionStatus === 'updating' && (
					<LinkButton>升级中...</LinkButton>
				)}
				{record.versionStatus !== 'now' && (
					<LinkButton
						disabled={record.versionStatus === 'updating'}
						onClick={() => shelves(record)}
					>
						下架
					</LinkButton>
				)}
			</Actions>
		);
	};
	const installUpdate = (record: middlewareProps) => {
		Modal.confirm({
			title: '操作确认',
			content: '是否确认升级到该版本？',
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				return updateMiddleware({
					clusterId: params.clusterId,
					chartName: record.chartName,
					chartVersion: record.chartVersion
				})
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '已升级到该版本'
							});
							setMenuRefresh && setMenuRefresh(true);
						} else {
							Modal.error({
								title: '失败',
								content:
									'升级失败，已维持升级前状态不变，可重试',
								okText: '我知道了'
							});
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};
	const shelves = (record: middlewareProps) => {
		Modal.confirm({
			title: '操作确认',
			content: '是否确认下架该版本中间件？',
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				return shelvesTypeVersion({
					chartName: record.chartName,
					chartVersion: record.chartVersion
				})
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '已下架该版本'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};

	return (
		<ProPage>
			<ProHeader
				title={`${params.type}版本管理`}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Alert
					message="本系统范围内其它集群使用过的中间件版本，都可以自主选择是否安装升级到更新版本"
					type="warning"
				/>
				<div className="middleware-version-content">
					<ProTable
						dataSource={dataSource}
						// exact
						// fixedBarExpandWidth={[24]}
						// affixActionBar
						showRefresh
						onRefresh={getData}
						// primaryKey="key"
						rowKey="key"
						operation={Operation}
						// onFilter={onFilter}
						// onSort={onSort}
					>
						<ProTable.Column
							title="类型"
							dataIndex="chartName"
							render={iconTypeRender}
						/>
						<ProTable.Column title="描述" dataIndex="description" />
						<ProTable.Column
							title="版本状态"
							dataIndex="versionStatus"
							render={versionStatusRender}
							filters={[
								{ text: '当前版本', value: 'now' },
								{ text: '可安装升级版本', value: 'future' },
								{ text: '历史版本', value: 'history' },
								{ text: '升级中', value: 'updating' }
							]}
							filterMultiple={false}
							onFilter={(value, record: any) =>
								record.versionStatus === value
							}
							width={200}
						/>
						<ProTable.Column
							title="版本"
							dataIndex="chartVersion"
							width={100}
						/>
						<ProTable.Column
							title="上架时间"
							dataIndex="createTime"
							render={(text: string) => (
								<span>
									{moment(text).format('YYYY-MM-DD h:mm:ss')}
								</span>
							)}
							width={200}
							sorter={(a: any, b: any) =>
								moment(a.createTime).unix() -
								moment(b.createTime).unix()
							}
						/>
						<ProTable.Column
							title="操作"
							dataIndex="action"
							width={150}
							render={actionRender}
						/>
					</ProTable>
				</div>
			</ProContent>
			{visible && (
				<UploadMiddlewareForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onCreate={onCreate}
				/>
			)}
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar,
	menu: state.menu
});
export default connect(mapStateToProps, { setMenuRefresh })(MiddlewareVersion);
