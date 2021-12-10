import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { Message, Button, Dialog, Balloon } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { StoreState, globalVarProps } from '@/types/index';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { getVersions, upgradeChart } from '@/services/serviceList';
import messageConfig from '@/components/messageConfig';
import { useHistory } from 'react-router';
import { middlewareProps } from './service.list';
import Table from '@/components/MidTable';
import { iconTypeRender } from '@/utils/utils';
import UploadMiddlewareForm from '../ServiceCatalog/components/UploadMiddlewareForm';
// import './index.scss';

const { Tooltip } = Balloon;

interface versionProps {
	globalVar: globalVarProps;
}
interface paramsProps {
	type: string;
}
enum versionStatus {
	now = '当前版本',
	future = '可升级版本',
	history = '历史版本',
	updating = 'operator升级中',
	needUpgradeOperator = '需要升级operator',
	canUpgrade = '升级版本'
}
function ServiceVersion(props: versionProps): JSX.Element {
	const {
		globalVar: { cluster, namespace }
	} = props;
	const params: paramsProps = useParams();
	const [originData, setOriginData] = useState<middlewareProps[]>([]);
	const [dataSource, setDataSource] = useState<middlewareProps[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const url = window.location.href.split('/');
	const history = useHistory();
	const [installNum, setInstallNum] = useState<number>();
	const [curIndex, setCurIndex] = useState<number>();

	const getData = () => {
		getVersions({
			clusterId: cluster.id,
			middlewareName: url[url.length - 2],
			namespace: namespace.name,
			type: url[url.length - 3]
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
			const type = filterParams[keys[0]].selectedKeys[0];
			if (
				type === 'future' ||
				type === 'updating' ||
				type === 'needUpgradeOperator'
			) {
				const list = originData.filter(
					(item) =>
						item[keys[0]] === 'future' ||
						item[keys[0]] === 'updating' ||
						item[keys[0]] === 'needUpgradeOperator'
				);
				setDataSource(list);
			} else {
				const list = originData.filter(
					(item) =>
						item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
				);
				setDataSource(list);
			}
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
				: (value === 'future' || value === 'updating' || value === 'needUpgradeOperator' || value === 'canUpgrade')
					? '#52C41A'
					: '#666666';
		const bgColor =
			value === 'now'
				? '#EBF8FF'
				: (value === 'future' || value === 'updating' || value === 'needUpgradeOperator' || value === 'canUpgrade')
					? '#F6FFED'
					: '#F5F5F5';
		const text =
			value === 'now'
				? '当前版本'
				: (value === 'future' || value === 'updating' || value === 'needUpgradeOperator' || value === 'canUpgrade')
					? '可升级版本'
					: '历史版本';
		return (
			<div
				className="version-status-display"
				style={{
					color: color,
					backgroundColor: bgColor,
					borderColor: color
				}}
			>
				{text}
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
				{(record.versionStatus === 'future' ||
					record.versionStatus === 'needUpgradeOperator' ||
					record.versionStatus === 'canUpgrade' ||
					record.versionStatus === 'updating') &&
					(record.versionStatus !== 'future' ? (
						<LinkButton
							style={{ color: '#3DBCFB' }}
							onClick={() => installUpdate(index, record)}
						>
							升级
							{index === curIndex && installNum
								? '中(' + installNum + 's)'
								: ''}
						</LinkButton>
					) : (
						<Tooltip
							trigger={
								<LinkButton
									style={{ color: '#cccccc' }}
									onClick={() => installUpdate(index, record)}
								>
									升级
								</LinkButton>
							}
							align="t"
						>
							不可跨版本升级
						</Tooltip>
					))}
			</Actions>
		);
	};
	const installUpdate = (index: number, record: middlewareProps) => {
		if (record.versionStatus === 'needUpgradeOperator') {
			const dialog = Dialog.show({
				title: '操作确认',
				content:
					'经系统检测，该版本的中间件还未安装，请到中间件市场进行升级安装',
				footer: (
					<>
						<Button type="primary" onClick={() => dialog.hide()}>
							我知道了
						</Button>
						<Button
							onClick={() => {
								dialog.hide();
								history.push(
									`/middlewareRepository/versionManagement/${url[url.length - 3]
									}`
								);
							}}
						>
							现在去升级
						</Button>
					</>
				)
			});
		} else if (record.versionStatus === 'canUpgrade') {
			Dialog.show({
				title: '操作确认',
				content: '是否确认升级新版本？',
				onOk: () => {
					return upgradeChart({
						clusterId: cluster.id,
						namespace: namespace.name,
						middlewareName: url[url.length - 2],
						type: url[url.length - 3],
						chartName: record.chartName,
						upgradeChartVersion: record.chartVersion
					}).then((res) => {
						let count = 6;
						setCurIndex(index);
						const timeout = setInterval(() => {
							setInstallNum(--count);
							if (count <= 0) {
								clearInterval(timeout);
								getData();
							}
						}, 1000);
					});
				}
			});
		} else if (record.versionStatus === 'updating') {
			const dialog = Dialog.show({
				title: '操作确认',
				content: 'operator升级中,请稍后升级',
				footer: (
					<Button type="primary" onClick={() => dialog.hide()}>
						我知道了
					</Button>
				)
			});
		} else {
			return;
		}
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
									<p>{url[url.length - 2]}</p>
									<p>{url[url.length - 1]}</p>
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
								{ label: '历史版本', value: 'history' }
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
