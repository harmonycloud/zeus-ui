import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { Message, Button, Dialog } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { StoreState } from '@/types/index';
import { Page, Content, Header } from '@alicloud/console-components-page';
import {
	getVersions,
	upgradeChart,
	upgradeCheck
} from '@/services/serviceList';
import messageConfig from '@/components/messageConfig';
import { useHistory } from 'react-router';
import { middlewareProps } from './service.list';
import Table from '@/components/MidTable';
import { iconTypeRender } from '@/utils/utils';
import UploadMiddlewareForm from '../ServiceCatalog/components/UploadMiddlewareForm';
import { serviceVersionStatus } from '@/utils/enum';
import { versionProps, paramsProps } from './service.list';

function ServiceVersion(props: versionProps): JSX.Element {
	const {
		globalVar: { cluster, namespace }
	} = props;
	const params: paramsProps = useParams();
	const { middlewareName, type, aliasName } = params;
	const [originData, setOriginData] = useState<middlewareProps[]>([]);
	const [dataSource, setDataSource] = useState<middlewareProps[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const history = useHistory();

	const getData = () => {
		getVersions({
			clusterId: cluster.id,
			middlewareName,
			namespace: namespace.name,
			type
		}).then((res) => {
			if (res.success) {
				setOriginData(res.data);
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
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
	const versionStatusRender = (
		value: string,
		index: number,
		record: middlewareProps
	) => {
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
		index: number,
		record: middlewareProps
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
			namespace: namespace.name,
			middlewareName,
			type,
			chartName: record.chartName,
			upgradeChartVersion: record.chartVersion
		}).then((res) => {
			if (res.success) {
				Dialog.show({
					title: '操作确认',
					content: '是否确认升级新版本？',
					onOk: () => {
						return upgradeChart({
							clusterId: cluster.id,
							namespace: namespace.name,
							middlewareName,
							type,
							chartName: record.chartName,
							upgradeChartVersion: record.chartVersion
						}).then((res) => {
							if (res.success) {
								getData();
							}else{
								originData.forEach((item: any, i: number) => {
									if (i === index) {
										item.versionStatus = 'future';
									}
									return item;
								});
								setDataSource([...originData]);
								Message.show(
									messageConfig('error', '失败', res.errorMsg)
								);
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
				const dialog = Dialog.show({
					title: '操作确认',
					content:
						'经系统检测，该版本的中间件还未安装，请到中间件市场进行升级安装',
					footer: (
						<>
							<Button
								type="primary"
								onClick={() => {
									originData.forEach(
										(item: any, i: number) => {
											if (i === index) {
												item.versionStatus = 'future';
											}
											return item;
										}
									);
									setDataSource([...originData]);
									dialog.hide();
								}}
							>
								我知道了
							</Button>
							<Button
								onClick={() => {
									dialog.hide();
									history.push(
										`/middlewareRepository/versionManagement/${type}`
									);
								}}
							>
								现在去升级
							</Button>
						</>
					)
				});
			}
		});
	};

	return (
		<Page>
			<Header
				title={`服务版本管理`}
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
						onFilter={onFilter}
						onSort={onSort}
					>
						<Table.Column
							title="服务名称/中文名称"
							dataIndex="chartName"
							cell={
								<div>
									<p>{middlewareName}</p>
									<p>{aliasName}</p>
								</div>
							}
						/>
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
								{ label: '可升级版本', value: 'future' },
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
export default connect(mapStateToProps, {})(ServiceVersion);
