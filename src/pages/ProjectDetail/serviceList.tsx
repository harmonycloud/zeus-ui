import React, { useEffect, useState } from 'react';
import {
	Radio,
	Input,
	RadioChangeEvent,
	Select,
	notification,
	Space
} from 'antd';
import { useHistory, useParams } from 'react-router';
import { connect } from 'react-redux';
import ProTable from '@/components/ProTable';
import { nullRender } from '@/utils/utils';
import {
	MiddlewareResourceInfo,
	MiddlewareTableItem
} from '../MyProject/myProject';
import storage from '@/utils/storage';
import { getProjectMiddleware } from '@/services/project';
import { DetailParams, ServiceListProps } from './projectDetail';
import { AutoCompleteOptionItem } from '@/types/comment';
import {
	setCluster,
	setNamespace,
	setRefreshCluster,
	setProject
} from '@/redux/globalVar/var';
import { StoreState } from '@/types';

const Search = Input.Search;
const RadioGroup = Radio.Group;
type SelectOption = AutoCompleteOptionItem;
function ServiceList(props: ServiceListProps): JSX.Element {
	const {
		globalVar,
		setCluster,
		setNamespace,
		setRefreshCluster,
		setProject
	} = props;
	const {
		clusterList: globalClusterList,
		namespaceList: globalNamespaceList,
		project,
		namespace: globalNamespace
	} = globalVar;
	const history = useHistory();
	const [tableDataSource, setTableDataSource] = useState<
		MiddlewareTableItem[]
	>([]);
	const [dataSource, setDataSource] = useState<MiddlewareResourceInfo[]>([]);
	const [tableType, setTableType] = useState<string>('cpu');
	const [loadingVisible, setLoadingVisible] = useState<boolean>(false);
	const [typeOptions, setTypeOptions] = useState<SelectOption[]>([]);
	const [selectType, setSelectType] = useState<string>('');
	const params: DetailParams = useParams();
	const { id } = params;
	useEffect(() => {
		getData();
	}, []);
	useEffect(() => {
		if (selectType) {
			setDataSource(
				tableDataSource.filter(
					(item: MiddlewareTableItem) => item.type === selectType
				)[0].middlewareResourceInfoList
			);
		}
	}, [selectType]);
	const getData = () => {
		setLoadingVisible(true);
		getProjectMiddleware({ projectId: id })
			.then((res) => {
				if (res.success) {
					setTableDataSource(res.data);
					if (res.data.length > 0) {
						const lt = res.data.map((item: MiddlewareTableItem) => {
							return {
								value: item.type,
								label: item.aliasName
							};
						});
						setTypeOptions(lt);
						setSelectType(lt[0].value);
					} else {
						setTypeOptions([]);
						setSelectType('');
					}
				} else {
					notification.error({
						message: '??????',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				setLoadingVisible(false);
			});
	};
	const handleSearch = (value: string) => {
		const list = tableDataSource
			.filter((item) => item.type === selectType)[0]
			.middlewareResourceInfoList.filter((i) => i.name.includes(value));
		setDataSource(list);
	};
	const onChange = (value: string) => {
		setSelectType(value);
	};
	const Operation = {
		primary: (
			<div
				style={{
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					height: 40
				}}
			>
				<Space>
					<div>????????????</div>
					<Select
						value={selectType}
						onChange={onChange}
						style={{ width: 120 }}
						options={typeOptions}
					/>
				</Space>
			</div>
		),
		secondary: (
			<>
				<Search
					placeholder="???????????????????????????"
					onSearch={handleSearch}
					allowClear={true}
					style={{ width: '260px', marginRight: 8 }}
				/>
				<RadioGroup
					value={tableType}
					onChange={(e: RadioChangeEvent) =>
						setTableType(e.target.value)
					}
				>
					<Radio.Button id="cpu" value="cpu">
						CPU
					</Radio.Button>
					<Radio.Button id="memory" value="memory">
						??????
					</Radio.Button>
					<Radio.Button id="storage" value="storage">
						??????
					</Radio.Button>
				</RadioGroup>
			</>
		)
	};
	const nameRender = (
		value: string,
		record: MiddlewareResourceInfo,
		index: number
	) => {
		return (
			<div style={{ maxWidth: '160px' }}>
				<div
					title={record.name}
					className="name-link text-overflow"
					onClick={() => {
						storage.setSession(
							'menuPath',
							`serviceList/${selectType}/${
								typeOptions.filter(
									(item) => item.value === selectType
								)[0].label
							}`
						);
						const cc = globalClusterList.filter(
							(item: any) => item.id === record.clusterId
						);
						setCluster(cc[0]);
						storage.setLocal('cluster', JSON.stringify(cc[0]));
						history.push(
							`/serviceList/${selectType}/${
								typeOptions.filter(
									(item) => item.value === selectType
								)[0].label
							}/basicInfo/${record.name}/${record.type}/${
								record.chartVersion
							}/${record.namespace}`
						);
					}}
				>
					{record.name}
				</div>
				<div title={record.aliasName} className="text-overflow">
					{record.aliasName}
				</div>
			</div>
		);
	};
	return (
		<ProTable
			loading={loadingVisible}
			dataSource={dataSource}
			rowKey="name"
			operation={Operation}
		>
			<ProTable.Column
				title="????????????/????????????"
				dataIndex="name"
				render={nameRender}
				width={180}
			/>
			{tableType === 'cpu' && (
				<ProTable.Column
					title="CPU???????????????"
					dataIndex="requestCpu"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => a.requestCpu - b.requestCpu}
				/>
			)}
			{tableType === 'cpu' && (
				<ProTable.Column
					title="???5min????????????????????????"
					dataIndex="per5MinCpu"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => a.per5MinCpu - b.per5MinCpu}
				/>
			)}
			{tableType === 'cpu' && (
				<ProTable.Column
					title="CPU????????????%???"
					dataIndex="cpuRate"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => a.cpuRate - b.cpuRate}
				/>
			)}
			{tableType === 'memory' && (
				<ProTable.Column
					title="???????????????GB???"
					dataIndex="requestMemory"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => a.requestMemory - b.requestMemory}
				/>
			)}
			{tableType === 'memory' && (
				<ProTable.Column
					title="???5min??????????????????GB???"
					dataIndex="per5MinMemory"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => a.per5MinMemory - b.per5MinMemory}
					// sortable
				/>
			)}
			{tableType === 'memory' && (
				<ProTable.Column
					title="??????????????????%???"
					dataIndex="memoryRate"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => Number(a.memoryRate) - Number(b.memoryRate)}
				/>
			)}
			{tableType === 'storage' && (
				<ProTable.Column
					title="???????????????G???"
					dataIndex="requestStorage"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => a.requestStorage - b.requestStorage}
				/>
			)}
			{tableType === 'storage' && (
				<ProTable.Column
					title="???5min??????????????????%???"
					dataIndex="per5MinStorage"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => a.per5MinStorage - b.per5MinStorage}
				/>
			)}
			{tableType === 'storage' && (
				<ProTable.Column
					title="??????????????????%???"
					dataIndex="storageRate"
					render={nullRender}
					width={200}
					sorter={(
						a: MiddlewareResourceInfo,
						b: MiddlewareResourceInfo
					) => a.storageRate - b.storageRate}
				/>
			)}
		</ProTable>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {
	setCluster,
	setNamespace,
	setRefreshCluster,
	setProject
})(ServiceList);
