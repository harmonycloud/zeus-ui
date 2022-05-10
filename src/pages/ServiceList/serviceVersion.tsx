import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { useHistory } from 'react-router';
import { notification, Modal, Alert } from 'antd';
import Actions from '@/components/Actions';
import { ProHeader, ProPage, ProContent } from '@/components/ProPage';
import ProTable from '@/components/ProTable';
import UploadMiddlewareForm from '../ServiceCatalog/components/UploadMiddlewareForm';
import { iconTypeRender } from '@/utils/utils';
import {
	getVersions,
	upgradeChart,
	upgradeCheck
} from '@/services/serviceList';
import { middlewareProps } from './service.list';
import { serviceVersionStatus } from '@/utils/enum';
import { StoreState } from '@/types/index';
import { versionProps, paramsProps } from './service.list';

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;
function ServiceVersion(props: versionProps): JSX.Element {
	const {
		globalVar: { cluster }
	} = props;
	const params: paramsProps = useParams();
	const { name, middlewareName, type, aliasName, namespace } = params;
	const [originData, setOriginData] = useState<middlewareProps[]>([]);
	const [dataSource, setDataSource] = useState<middlewareProps[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const history = useHistory();

	const getData = () => {
		getVersions({
			clusterId: cluster.id,
			middlewareName,
			namespace,
			type
		}).then((res) => {
			if (res.success) {
				setOriginData(res.data);
				setDataSource(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	useEffect(() => {
		getData();
	}, []);
	const onCreate = () => {
		getData();
	};
	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = originData.filter(
				(item) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
			setDataSource(list);
		} else {
			setDataSource(originData);
		}
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const dsTemp = originData.sort((a, b) => {
				const result =
					moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		}
	};
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
				{serviceVersionStatus[value]}
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
				{record.versionStatus === 'future' ||
				record.versionStatus === 'updating' ? (
					<LinkButton
						style={{
							color: `${
								dataSource.find(
									(item) => item.versionStatus === 'updating'
								) && record.versionStatus !== 'updating'
									? '#cccccc'
									: '#0070cc'
							}`
						}}
						onClick={() => installUpdate(index, record)}
					>
						{record.versionStatus === 'future'
							? '升级'
							: '升级中...'}
					</LinkButton>
				) : null}
			</Actions>
		);
	};
	const nameRender = (value: string, record: any, index: number) => {
		return (
			<div style={{ maxWidth: '160px' }}>
				<div
					className="name-link text-overflow"
					onClick={() =>
						history.push(
							`/serviceList/${name}/${aliasName}/basicInfo/${middlewareName}/${type}/${record.chartVersion}/${namespace}`
						)
					}
				>
					{middlewareName}
				</div>
				<div className="text-overflow">{middlewareName}</div>
			</div>
		);
	};
	const installUpdate = (index: number, record: middlewareProps) => {
		originData.forEach((item: any, i: number) => {
			if (i === index) {
				item.versionStatus = 'updating';
			}
			return item;
		});
		setDataSource([...originData]);
		upgradeCheck({
			clusterId: cluster.id,
			namespace,
			middlewareName,
			type,
			chartName: record.chartName,
			upgradeChartVersion: record.chartVersion
		}).then((res) => {
			if (res.success) {
				confirm({
					title: '操作确认',
					content: '是否确认升级新版本？',
					onOk: () => {
						return upgradeChart({
							clusterId: cluster.id,
							namespace,
							middlewareName,
							type,
							chartName: record.chartName,
							upgradeChartVersion: record.chartVersion
						}).then((res) => {
							if (res.success) {
								getData();
							} else {
								originData.forEach((item: any, i: number) => {
									if (i === index) {
										item.versionStatus = 'future';
									}
									return item;
								});
								setDataSource([...originData]);
								notification.error({
									message: '失败',
									description: res.errorMsg
								});
							}
						});
					},
					onCancel: () => {
						originData.forEach((item: any, i: number) => {
							if (i === index) {
								item.versionStatus = 'future';
							}
							return item;
						});
						setDataSource([...originData]);
					}
				});
			} else if (res.code === 720004) {
				confirm({
					title: '操作确认',
					content:
						'经系统检测，该版本的中间件还未安装，请到中间件市场进行升级安装',
					okText: '我知道了',
					cancelText: '现在去升级',
					onOk() {
						originData.forEach((item: any, i: number) => {
							if (i === index) {
								item.versionStatus = 'future';
							}
							return item;
						});
						setDataSource([...originData]);
					},
					onCancel() {
						history.push(
							`/middlewareRepository/versionManagement/${type}`
						);
					}
					// footer: (
					// 	<>
					// 		<Button
					// 			type="primary"
					// 			onClick={() => {
					// 				originData.forEach(
					// 					(item: any, i: number) => {
					// 						if (i === index) {
					// 							item.versionStatus = 'future';
					// 						}
					// 						return item;
					// 					}
					// 				);
					// 				setDataSource([...originData]);
					// 				dialog.hide();
					// 			}}
					// 		>
					// 			我知道了
					// 		</Button>
					// 		<Button
					// 			onClick={() => {
					// 				dialog.hide();
					// 				history.push(
					// 					`/middlewareRepository/versionManagement/${type}`
					// 				);
					// 			}}
					// 		>
					// 			现在去升级
					// 		</Button>
					// 	</>
					// ),
					// onCancel: () => {
					// 	originData.forEach((item: any, i: number) => {
					// 		if (i === index) {
					// 			item.versionStatus = 'future';
					// 		}
					// 		return item;
					// 	});
					// 	setDataSource([...originData]);
					// }
				});
			} else if (res.code === 720003) {
				confirm({
					title: '操作确认',
					content: 'operator升级中,请稍后升级',
					onOk() {
						originData.forEach((item: any, i: number) => {
							if (i === index) {
								item.versionStatus = 'future';
							}
							return item;
						});
						setDataSource([...originData]);
					},
					onCancel() {
						originData.forEach((item: any, i: number) => {
							if (i === index) {
								item.versionStatus = 'future';
							}
							return item;
						});
						setDataSource([...originData]);
					}
					// footer: (
					// 	<Button
					// 		type="primary"
					// 		onClick={() => {
					// 			originData.forEach((item: any, i: number) => {
					// 				if (i === index) {
					// 					item.versionStatus = 'future';
					// 				}
					// 				return item;
					// 			});
					// 			setDataSource([...originData]);
					// 			dialog.hide();
					// 		}}
					// 	>
					// 		我知道了
					// 	</Button>
					// ),
					// onClose: () => {
					// 	originData.forEach((item: any, i: number) => {
					// 		if (i === index) {
					// 			item.versionStatus = 'future';
					// 		}
					// 		return item;
					// 	});
					// 	setDataSource([...originData]);
					// }
				});
			} else if (res.code === 720002) {
				confirm({
					title: '操作确认',
					content: res.errorDetail,
					onOk() {
						originData.forEach((item: any, i: number) => {
							if (i === index) {
								item.versionStatus = 'future';
							}
							return item;
						});
						setDataSource([...originData]);
					},
					onCancel() {
						originData.forEach((item: any, i: number) => {
							if (i === index) {
								item.versionStatus = 'future';
							}
							return item;
						});
						setDataSource([...originData]);
					}
					// footer: (
					// 	<>
					// 		<Button
					// 			type="primary"
					// 			onClick={() => {
					// 				originData.forEach(
					// 					(item: any, i: number) => {
					// 						if (i === index) {
					// 							item.versionStatus = 'future';
					// 						}
					// 						return item;
					// 					}
					// 				);
					// 				setDataSource([...originData]);
					// 				dialog.hide();
					// 			}}
					// 		>
					// 			确认
					// 		</Button>
					// 		<Button
					// 			type="primary"
					// 			onClick={() => {
					// 				originData.forEach(
					// 					(item: any, i: number) => {
					// 						if (i === index) {
					// 							item.versionStatus = 'future';
					// 						}
					// 						return item;
					// 					}
					// 				);
					// 				setDataSource([...originData]);
					// 				dialog.hide();
					// 			}}
					// 		>
					// 			取消
					// 		</Button>
					// 	</>
					// ),
					// onClose: () => {
					// 	originData.forEach((item: any, i: number) => {
					// 		if (i === index) {
					// 			item.versionStatus = 'future';
					// 		}
					// 		return item;
					// 	});
					// 	setDataSource([...originData]);
					// }
				});
			}
		});
	};

	return (
		<ProPage>
			<ProHeader
				title={`服务版本管理`}
				// hasBackArrow={true}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Alert
					type="warning"
					showIcon={true}
					message="本系统范围内其它集群使用过的中间件版本，都可以自主选择是否安装升级到更新版本"
				/>
				<div className="middleware-version-content">
					<ProTable
						dataSource={dataSource}
						// exact
						// fixedBarExpandWidth={[24]}
						// affixActionBar
						showRefresh
						onRefresh={getData}
						rowKey="key"
						// onFilter={onFilter}
						// onSort={onSort}
					>
						<ProTable.Column
							title="服务名称/中文名称"
							dataIndex="chartName"
							render={nameRender}
						/>
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
								{ text: '可升级版本', value: 'future' },
								{ text: '历史版本', value: 'history' },
								{ text: '升级中', value: 'updating' }
							]}
							filterMultiple={false}
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
							sorter={(a: middlewareProps, b: middlewareProps) =>
								moment(a.createTime).unix() -
								moment(b.createTime).unix()
							}
							// sortable
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
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(ServiceVersion);
