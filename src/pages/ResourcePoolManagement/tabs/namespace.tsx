import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ProTable from '@/components/ProTable';
import moment from 'moment';
import { Button, notification, Switch, Tooltip, Modal } from 'antd';
import { connect } from 'react-redux';
import {
	getNamespaces,
	deleteNamespace,
	regNamespace
} from '@/services/common';
import { NamespaceResourceProps } from '../resource.pool';
import { paramsProps } from '../detail';
import { nullRender } from '@/utils/utils';
import AddNamespace from './addNamespace';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { getIsAccessGYT } from '@/services/common';
import Actions from '@/components/Actions';
interface NamespaceProps {
	setRefreshCluster: (flag: boolean) => void;
}
const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
const Namespace = (props: NamespaceProps) => {
	const { setRefreshCluster } = props;
	const [dataSource, setDataSource] = useState<NamespaceResourceProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const { id }: paramsProps = useParams();
	const [isAccess, setIsAccess] = useState<boolean>(false);
	useEffect(() => {
		getIsAccessGYT().then((res) => {
			if (res.success) {
				setIsAccess(res.data);
			}
		});
	}, []);
	useEffect(() => {
		let mounted = true;
		getNamespaces({
			clusterId: id,
			all: true,
			withQuota: true,
			withMiddleware: true,
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				if (mounted) {
					const temp = res.data.sort(function (a: any, b: any) {
						const result =
							Number(a.registered) - Number(b.registered);
						return result > 0 ? -1 : 1;
					});
					const newTemp = temp.sort(function (a: any, b: any) {
						const result =
							Number(a.phase === 'Active') -
							Number(b.phase === 'Active');
						return result > 0 ? -1 : 1;
					});
					setDataSource([...newTemp]);
					setDataSource(res.data);
				}
			} else {
				notification.error({
					message: '??????',
					description: res.errorMsg
				});
			}
		});
		return () => {
			mounted = false;
		};
	}, [keyword]);
	const getData = () => {
		getNamespaces({
			clusterId: id,
			all: true,
			withQuota: true,
			withMiddleware: true,
			keyword: keyword
		}).then((res) => {
			if (res.success) {
				const temp = res.data.sort(function (a: any, b: any) {
					const result = Number(a.registered) - Number(b.registered);
					return result > 0 ? -1 : 1;
				});
				const newTemp = temp.sort(function (a: any, b: any) {
					const result =
						Number(a.phase === 'Active') -
						Number(b.phase === 'Active');
					return result > 0 ? -1 : 1;
				});
				setDataSource([...newTemp]);
			} else {
				notification.error({
					message: '??????',
					description: res.errorMsg
				});
			}
		});
	};
	const Operation = {
		primary: (
			<Button
				disabled={isAccess}
				title={isAccess ? '??????????????????????????????????????????????????????' : ''}
				type="primary"
				onClick={() => setVisible(true)}
			>
				??????
			</Button>
		)
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
	};
	const handleChange = (value: boolean, record: NamespaceResourceProps) => {
		regNamespace({
			clusterId: id,
			name: record.name,
			registered: value
		}).then((res) => {
			if (res.success) {
				const msg = value ? '????????????????????????' : '????????????????????????';
				notification.success({
					message: '??????',
					description: msg
				});
				const list = dataSource.map((item) => {
					if (item.name === record.name) {
						item.registered = value;
					}
					return item;
				});
				setDataSource(list);
				setRefreshCluster(true);
			} else {
				notification.error({
					message: '??????',
					description: res.errorMsg
				});
			}
		});
	};
	const registeredRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		return record.registered && record.middlewareReplicas ? (
			<Tooltip title="??????????????????????????????????????????????????????????????????">
				<Switch
					title={
						isAccess ? '??????????????????????????????????????????????????????' : ''
					}
					disabled={isAccess}
					checked={value}
				/>
			</Tooltip>
		) : (
			<Switch
				checked={value}
				title={isAccess ? '??????????????????????????????????????????????????????' : ''}
				disabled={record.phase !== 'Active' || isAccess}
				onChange={(value: boolean) => handleChange(value, record)}
			/>
		);
	};
	const actionRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		if (
			(record.registered && record.middlewareReplicas) ||
			record.phase !== 'Active'
		) {
			return (
				<Actions>
					<LinkButton
						disabled={true}
						title={
							isAccess
								? '??????????????????????????????????????????????????????'
								: record.phase === 'Active'
								? '??????????????????????????????????????????????????????????????????'
								: '???????????????????????????????????????'
						}
					>
						??????
					</LinkButton>
				</Actions>
			);
		}
		return (
			<Actions>
				<LinkButton
					disabled={isAccess}
					title={
						isAccess ? '??????????????????????????????????????????????????????' : ''
					}
					onClick={() => {
						confirm({
							title: '????????????',
							content: '?????????????????????????????????',
							icon: <ExclamationCircleOutlined />,
							okText: '??????',
							cancelText: '??????',
							onOk() {
								return deleteNamespace({
									clusterId: id,
									name: record.name
								}).then((res) => {
									if (res.success) {
										notification.success({
											message: '??????',
											description: '????????????????????????'
										});
										getData();
									} else {
										notification.error({
											message: '??????',
											description: res.errorMsg
										});
									}
								});
							}
						});
					}}
				>
					??????
				</LinkButton>
			</Actions>
		);
	};
	const memoryRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		const result = record.quotas?.memory[1] || '-';
		return <span>{result}</span>;
	};
	const cpuRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		const result = record.quotas?.cpu[1] || '-';
		return <span>{result}</span>;
	};
	const nameRender = (
		value: any,
		record: NamespaceResourceProps,
		index: number
	) => {
		return (
			<span
				className={record.phase !== 'Active' ? 'delete-disabled' : ''}
			>
				{record.aliasName || record.name}
			</span>
		);
	};
	return (
		<div>
			<ProTable
				dataSource={dataSource}
				rowKey="name"
				operation={Operation}
				showColumnSetting
				showRefresh
				onRefresh={getData}
				search={{
					onSearch: handleSearch,
					placeholder: '?????????????????????????????????'
				}}
			>
				<ProTable.Column
					title="????????????"
					dataIndex="aliasName"
					render={nameRender}
				/>
				<ProTable.Column
					title="?????????????????????"
					dataIndex="name"
					ellipsis={true}
					// render={nameRender}
				/>
				<ProTable.Column
					title="CPU???????????????"
					dataIndex="cpu"
					render={cpuRender}
					sorter={(a, b) => {
						return (
							Number(a.quotas?.cpu[1] || null) -
							Number(b.quotas?.cpu[1] || null)
						);
					}}
				/>
				<ProTable.Column
					title="???????????????GB???"
					dataIndex="memory"
					render={memoryRender}
					sorter={(a, b) => {
						return (
							Number(a.quotas?.memory[1] || null) -
							Number(b.quotas?.memory[1] || null)
						);
					}}
				/>
				<ProTable.Column
					title="???????????????"
					dataIndex="middlewareReplicas"
					render={nullRender}
					sorter={(
						a: NamespaceResourceProps,
						b: NamespaceResourceProps
					) => a.middlewareReplicas || 0 - b.middlewareReplicas || 0}
				/>
				<ProTable.Column
					title="????????????"
					dataIndex="createTime"
					width={180}
					sorter={(
						a: NamespaceResourceProps,
						b: NamespaceResourceProps
					) =>
						moment(a.createTime).unix() -
						moment(b.createTime).unix()
					}
				/>
				<ProTable.Column
					title="??????"
					dataIndex="registered"
					width={80}
					render={registeredRender}
				/>
				<ProTable.Column
					title="??????"
					dataIndex="action"
					width={80}
					render={actionRender}
				/>
			</ProTable>
			{visible && (
				<AddNamespace
					visible={visible}
					onCancel={() => setVisible(false)}
					clusterId={id}
					onRefresh={getData}
				/>
			)}
		</div>
	);
};
export default connect(() => ({}), {
	setRefreshCluster
})(Namespace);
