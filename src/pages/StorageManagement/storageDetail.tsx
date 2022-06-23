import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import moment from 'moment';
import { notification, Table, Drawer } from 'antd';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { serviceListStatusRender } from '@/utils/utils';
import MidProcess from '@/components/MidProcess';
import DataFields from '@/components/DataFields';
import storageIcon from '@/assets/images/storage-manage.svg';
import { states } from '@/utils/const';
import {
	DetailParams,
	GetDetailParams,
	StorageItem,
	StorageMiddlewareParams
} from './storageManage';
import { getStorageDetail, getStorageMiddleware } from '@/services/storage';
import { api } from '@/api.json';
import nodata from '@/assets/images/nodata.svg';

export default function StorageDetail(): JSX.Element {
	const params: DetailParams = useParams();
	const [dataSource, setDataSource] = useState<StorageItem>();
	const [middlewares, setMiddlewares] = useState<StorageMiddlewareParams[]>(
		[]
	);
	const [loading, setLoading] = useState<boolean>(true);
	const [visible, setVisible] = useState<boolean>(false);
	const [current, setCurrent] = useState<StorageMiddlewareParams>();
	const usedRender = (value: any, record: StorageMiddlewareParams) => {
		const per =
			((record.monitorResourceQuota.storage.used || 0) /
				(record.monitorResourceQuota.storage.total || 0)) *
			100;
		return (
			<MidProcess
				per={per || 0}
				used={record.monitorResourceQuota.storage.used}
				total={record.monitorResourceQuota.storage.total}
				right="rgb(127, 177, 255)"
				bottom="rgb(122, 212, 255)"
			/>
		);
	};
	const belongRender = (value: any, record: StorageMiddlewareParams) => {
		return (
			<div style={{ width: '200px' }}>
				<div className="text-overflow">
					项目：{record.projectAliasName || '-'}
				</div>
				<div className="text-overflow">
					命名空间：{record.namespace || '-'}
				</div>
			</div>
		);
	};
	const nameAndAliasNameWithIcon = (
		value: any,
		record: StorageMiddlewareParams
	) => {
		return (
			<div className="icon-type-content" style={{ width: '180px' }}>
				<img
					width={28}
					height={28}
					src={
						record.imagePath
							? `${api}/images/middleware/${record.imagePath}`
							: nodata
					}
					alt={record.chartName}
				/>
				<div style={{ marginLeft: 8, width: 'calc(180px - 36px)' }}>
					<div
						className="name-link text-overflow"
						onClick={() => {
							setCurrent(record);
							setVisible(true);
						}}
						title={record.middlewareName}
					>
						{record.middlewareName}
					</div>
					<div
						className="text-overflow"
						title={record.middlewareAliasName}
					>
						{record.middlewareAliasName}
					</div>
				</div>
			</div>
		);
	};
	const item = [
		{
			dataIndex: 'title',
			render: () => (
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title">基本信息</div>
				</div>
			),
			span: 24
		},
		{
			dataIndex: 'clusterAliasName',
			label: '所属集群'
		},
		{
			dataIndex: 'volumeType',
			label: '存储类型'
		},
		{
			dataIndex: 'vgName',
			label: 'VG名称',
			render: (val: string) => val || '/'
		},
		{
			dataIndex: 'createTime',
			label: '创建时间'
		}
	];
	const localPathItem = [
		{
			dataIndex: 'title',
			render: () => (
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title">基本信息</div>
				</div>
			),
			span: 24
		},
		{
			dataIndex: 'clusterAliasName',
			label: '所属集群'
		},
		{
			dataIndex: 'volumeType',
			label: '存储类型'
		},
		{
			dataIndex: 'createTime',
			label: '创建时间'
		}
	];
	const item2 = [
		{
			dataIndex: 'title',
			render: (val: string) => (
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title">服务列表</div>
				</div>
			),
			span: 24
		},
		{
			dataIndex: 'table',
			render: () => {
				return (
					<Table
						rowKey="name"
						dataSource={middlewares}
						style={{ width: '100%' }}
						loading={loading}
					>
						<Table.Column
							dataIndex="aliasName"
							title="服务名称/中文名称"
							width={180}
							fixed="left"
							render={nameAndAliasNameWithIcon}
						/>
						<Table.Column
							dataIndex="status"
							title="状态"
							render={serviceListStatusRender}
							filters={states}
							filterMultiple={false}
							onFilter={(
								value: string | number | boolean,
								record: StorageMiddlewareParams
							) => {
								return record.status === value;
							}}
						/>
						<Table.Column dataIndex="podNum" title="实例数" />
						<Table.Column
							dataIndex="belong"
							title="所属"
							width={200}
							render={belongRender}
						/>
						<Table.Column
							dataIndex="used"
							title="存储使用量(GB)"
							render={usedRender}
						/>
						<Table.Column
							dataIndex="createTime"
							title="创建时间"
							sorter={(
								a: StorageMiddlewareParams,
								b: StorageMiddlewareParams
							) =>
								moment(a.createTime).unix() -
								moment(b.createTime).unix()
							}
						/>
					</Table>
				);
			}
		}
	];
	useEffect(() => {
		const sendData: GetDetailParams = {
			clusterId: params.clusterId,
			storageName: params.name
		};
		getStorageDetail(sendData).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		getStorageMiddleware(sendData)
			.then((res) => {
				if (res.success) {
					setMiddlewares(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);
	const memoryUsedRender = (value: any, record: StorageMiddlewareParams) => {
		return `${record.monitorResourceQuota.storage.used || 0}GB`;
	};
	return (
		<ProPage>
			<ProHeader
				avatar={{
					children: <img src={storageIcon} />,
					shape: 'square',
					size: 48,
					style: { background: '#F5F5F5' }
				}}
				title={params.aliasName}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<DataFields
					dataSource={dataSource || {}}
					items={
						dataSource?.volumeType === 'LocalPath'
							? localPathItem
							: item
					}
				/>
				<div className="detail-divider" />
				<DataFields dataSource={{}} items={item2} />
				{visible && current && (
					<Drawer
						title={
							<div className="icon-type-content">
								<img
									width={14}
									height={14}
									src={
										current.imagePath
											? `${api}/images/middleware/${current.imagePath}`
											: nodata
									}
									style={{ filter: 'grayscale(100%)' }}
									alt={current.chartName}
								/>
								<div style={{ marginLeft: 8 }}>
									{current.middlewareAliasName}详情
								</div>
							</div>
						}
						placement="right"
						size="large"
						onClose={() => setVisible(false)}
						visible={visible}
					>
						<Table rowKey="podName" dataSource={current.pods}>
							<Table.Column
								dataIndex="podName"
								title="节点名称"
								ellipsis={true}
								width={250}
							/>
							<Table.Column
								width={100}
								dataIndex="role"
								title="节点类型"
								ellipsis={true}
							/>
							<Table.Column
								dataIndex="memoryUsed"
								title="存储使用量(GB)"
								render={memoryUsedRender}
								ellipsis={true}
							/>
							<Table.Column
								dataIndex="createTime"
								title="创建时间"
								render={(value) =>
									moment(value).format('YYYY-MM-DD HH:mm:ss')
								}
								ellipsis={true}
							/>
						</Table>
					</Drawer>
				)}
			</ProContent>
		</ProPage>
	);
}
