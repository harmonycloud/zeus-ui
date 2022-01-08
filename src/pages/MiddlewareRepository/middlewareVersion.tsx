import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { Message, Button, Dialog } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { StoreState, globalVarProps } from '@/types/index';
import { Page, Content, Header } from '@alicloud/console-components-page';
import {
	getTypeVersion,
	updateMiddleware,
	shelvesTypeVersion
} from '@/services/repository';
import messageConfig from '@/components/messageConfig';
import { middlewareProps } from './middleware';
import Table from '@/components/MidTable';
import { iconTypeRender } from '@/utils/utils';
import UploadMiddlewareForm from '../ServiceCatalog/components/UploadMiddlewareForm';
import './index.scss';

interface versionProps {
	globalVar: globalVarProps;
}
interface paramsProps {
	type: string;
}
enum versionStatus {
	now = '当前版本',
	future = '可安装升级版本',
	history = '历史版本',
	updating = '升级中'
}
function MiddlewareVersion(props: versionProps): JSX.Element {
	const {
		globalVar: { cluster }
	} = props;
	const params: paramsProps = useParams();
	const [originData, setOriginData] = useState<middlewareProps[]>([]);
	const [dataSource, setDataSource] = useState<middlewareProps[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(cluster) !== '{}') {
			getTypeVersion({
				clusterId: cluster.id,
				type: params.type
			}).then((res) => {
				if (res.success) {
					if (mounted) {
						setOriginData(res.data);
					}
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
		return () => {
			mounted = false;
		};
	}, [props]);
	const getData = () => {
		getTypeVersion({
			clusterId: cluster.id,
			type: params.type
		}).then((res) => {
			if (res.success) {
				setOriginData(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
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
	const versionStatusRender = (
		value: string,
		index: number,
		record: middlewareProps
	) => {
		const color =
			value === 'now'
				? '#00A7FA'
				: value === ('future' || 'updating')
				? '#52C41A'
				: '#666666';
		const bgColor =
			value === 'now'
				? '#EBF8FF'
				: value === ('future' || 'updating')
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
		index: number,
		record: middlewareProps
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
		Dialog.show({
			title: '操作确认',
			content: '是否确认升级到该版本？',
			onOk: () => {
				return updateMiddleware({
					clusterId: cluster.id,
					chartName: record.chartName,
					chartVersion: record.chartVersion
				})
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig(
									'success',
									'成功',
									'已升级到该版本'
								)
							);
						} else {
							const dialog = Dialog.show({
								title: '失败',
								content:
									'升级失败，已维持升级前状态不变，可重试',
								footer: (
									<Button
										type="primary"
										onClick={() => dialog.hide()}
									>
										我知道了
									</Button>
								)
							});
							// Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};
	const shelves = (record: middlewareProps) => {
		Dialog.show({
			title: '操作确认',
			content: '是否确认下架该版本中间件？',
			onOk: () => {
				return shelvesTypeVersion({
					chartName: record.chartName,
					chartVersion: record.chartVersion
				})
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', '已下架该版本')
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};

	return (
		<Page>
			<Header
				title={`${params.type}版本管理`}
				hasBackArrow={true}
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Message type="warning">
					本系统范围内其它资源池使用过的中间件版本，都可以自主选择是否安装升级到更新版本
				</Message>
				<div className="middleware-version-content">
					<Table
						dataSource={dataSource}
						exact
						fixedBarExpandWidth={[24]}
						affixActionBar
						showRefresh
						onRefresh={getData}
						primaryKey="key"
						operation={Operation}
						onFilter={onFilter}
						onSort={onSort}
					>
						<Table.Column
							title="类型"
							dataIndex="chartName"
							cell={iconTypeRender}
						/>
						<Table.Column title="描述" dataIndex="description" />
						<Table.Column
							title="版本状态"
							dataIndex="versionStatus"
							cell={versionStatusRender}
							filters={[
								{ label: '当前版本', value: 'now' },
								{ label: '可安装升级版本', value: 'future' },
								{ label: '历史版本', value: 'history' },
								{ label: '升级中', value: 'updating' }
							]}
							filterMode="single"
							width={200}
						/>
						<Table.Column
							title="版本"
							dataIndex="chartVersion"
							width={100}
						/>
						<Table.Column
							title="上架时间"
							dataIndex="createTime"
							cell={(text: string) => (
								<span>
									{moment(text).format('YYYY-MM-DD h:mm:ss')}
								</span>
							)}
							width={200}
							sortable
						/>
						<Table.Column
							title="操作"
							dataIndex="action"
							width={150}
							cell={actionRender}
						/>
					</Table>
				</div>
			</Content>
			{visible && (
				<UploadMiddlewareForm
					visible={visible}
					onCancel={() => setVisible(false)}
					onCreate={onCreate}
				/>
			)}
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(MiddlewareVersion);
