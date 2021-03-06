import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Switch, Modal, notification } from 'antd';
import ProTable from '@/components/ProTable';
import Actions from '@/components/Actions';

import { useHistory } from 'react-router';
import { getClusters } from '@/services/common';
import ComponentsNull from '@/components/ComponentsNull';
import DefaultPicture from '@/components/DefaultPicture';
import { nullRender } from '@/utils/utils';
import { alarmWarn, silences } from '@/utils/const';
import moment from 'moment';

import {
	deleteAlarm,
	deleteAlarms,
	getUsedAlarms,
	getUsedAlarm,
	updateAlarms,
	updateAlarm
} from '@/services/middleware';
import storage from '@/utils/storage';
import { DetailParams, RuleProps, ServiceRuleItem } from '../detail';

const LinkButton = Actions.LinkButton;
function Rules(props: RuleProps): JSX.Element {
	const history = useHistory();
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities,
		monitor,
		alarmType
	} = props;
	const params: DetailParams = useParams();
	const { name, aliasName, currentTab, chartVersion } = params;
	const [searchText, setSearchText] = useState<string>('');
	const [dataSource, setDataSource] = useState<ServiceRuleItem[]>([]);
	const [originData, setOriginData] = useState<ServiceRuleItem[]>([]);
	const [poolList, setPoolList] = useState([]);

	const onRefresh = () => {
		getData(clusterId, middlewareName, namespace, searchText);
	};

	const createTimeRender = (value: string) => {
		if (!value) return '--';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	useEffect(() => {
		getData(clusterId, middlewareName, namespace, searchText);
	}, [searchText]);

	useEffect(() => {
		getData(clusterId, middlewareName, namespace, searchText);
		getClusters().then((res) => {
			if (!res.data) return;
			setPoolList(
				res.data.map((item: any) => {
					return { text: item.nickname, value: item.id };
				})
			);
		});
	}, [props]);

	const getData = (
		clusterId: string,
		middlewareName?: string,
		namespace?: string,
		keyword?: string
	) => {
		if (alarmType === 'system') {
			const sendData = {
				clusterId,
				keyword,
				lay: 'system'
			};
			getUsedAlarm(sendData).then((res) => {
				if (res.success) {
					setDataSource(res.data.list);
					setOriginData(res.data.list);
				} else {
					notification.error({
						message: '??????',
						description: res.errorMsg
					});
				}
			});
		} else {
			const sendData = {
				clusterId,
				keyword,
				middlewareName,
				namespace,
				lay: 'service'
			};
			getUsedAlarms(sendData).then((res) => {
				if (res.success) {
					setDataSource(res.data.list);
					setOriginData(res.data.list);
				} else {
					notification.error({
						message: '??????',
						description: res.errorMsg
					});
				}
			});
		}
	};

	const removeAlarm = (record: ServiceRuleItem) => {
		if (alarmType === 'system') {
			const sendData = {
				clusterId,
				alert: record.alert,
				alertRuleId: record.alertId
			};
			Modal.confirm({
				title: '????????????',
				content: '???????????????????',
				onOk: () => {
					deleteAlarm(sendData).then((res) => {
						if (res.success) {
							getData(clusterId, middlewareName, namespace, '');
							notification.success({
								message: '??????',
								description: '????????????'
							});
						} else {
							notification.error({
								message: '??????',
								description: res.errorMsg
							});
						}
					});
				}
			});
		} else {
			const sendData = {
				clusterId,
				middlewareName,
				namespace,
				alert: record.alert,
				alertRuleId: record.alertId
			};
			Modal.confirm({
				title: '????????????',
				content: '???????????????????',
				onOk: () => {
					deleteAlarms(sendData).then((res) => {
						if (res.success) {
							getData(clusterId, middlewareName, namespace, '');
							notification.success({
								message: '??????',
								description: '????????????'
							});
						} else {
							notification.error({
								message: '??????',
								description: res.errorMsg
							});
						}
					});
				}
			});
		}
	};

	const actionRender = (
		value: any,
		record: ServiceRuleItem,
		index: number
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						alarmType === 'system'
							? history.push(
									`/systemManagement/systemAlarm/createAlarm/system/${record.alertId}`
							  )
							: history.push(
									`/serviceList/${name}/${aliasName}/${currentTab}/createAlarm/${middlewareName}/${type}/${chartVersion}/${clusterId}/${namespace}/${record.alertId}`
							  );
						storage.setSession('alarm', { ...props, record });
					}}
				>
					??????
				</LinkButton>
				<LinkButton onClick={() => removeAlarm(record)}>
					??????
				</LinkButton>
			</Actions>
		);
	};

	const Operation = {
		primary: (
			<Button
				type="primary"
				onClick={() => {
					alarmType === 'system'
						? history.push(
								'/systemManagement/systemAlarm/createAlarm/system'
						  )
						: history.push(
								`/serviceList/${name}/${aliasName}/${currentTab}/createAlarm/${middlewareName}/${type}/${chartVersion}/${clusterId}/${namespace}`
						  );
					storage.setSession('alarm', props);
				}}
			>
				??????
			</Button>
		)
	};

	const ruleRender = (value: any, record: ServiceRuleItem, index: number) =>
		`${record.description}${record.symbol}${record.threshold}%???${
			record.alertTime || ''
		}???????????????${record.alertTimes || ''}???`;

	const levelRender = (value: any) => {
		const temp = alarmWarn.find((item) => item.value === value.severity);
		return (
			<span className={value?.severity + ' level'}>
				{value && temp ? temp?.text : ''}
			</span>
		);
	};

	const nameRender = (value: any, record: ServiceRuleItem, index: number) => {
		return (
			<span>
				{alarmType === 'system'
					? value
					: clusterId +
					  '/' +
					  namespace +
					  '/' +
					  type +
					  '/' +
					  middlewareName}
			</span>
		);
	};

	const enableRender = (
		value: string,
		record: ServiceRuleItem,
		index: number
	) => {
		return (
			<Switch
				checked={Number(value) === 1}
				onChange={(checked) => {
					if (alarmType === 'system') {
						const sendData = {
							url: {
								clusterId: record.labels?.clusterId
							},
							alertRuleId: record.alertId,
							ding: record.ding,
							data: {
								middlewareAlertsDTO: {
									...record,
									enable: checked ? 1 : 0
								},
								users: []
							}
						};
						updateAlarm(sendData).then((res) => {
							if (res.success) {
								getData(
									clusterId,
									middlewareName,
									namespace,
									''
								);
								notification.success({
									message: '??????',
									description: '????????????'
								});
							} else {
								notification.error({
									message: '??????',
									description: res.errorMsg
								});
							}
						});
					} else {
						const sendData = {
							url: {
								clusterId,
								namespace,
								middlewareName
							},
							alertRuleId: record.alertId,
							ding: record.ding,
							data: {
								middlewareAlertsDTO: {
									...record,
									enable: checked ? 1 : 0
								},
								users: []
							}
						};
						updateAlarms(sendData).then((res) => {
							if (res.success) {
								getData(
									clusterId,
									middlewareName,
									namespace,
									''
								);
								notification.success({
									message: '??????',
									description: '????????????'
								});
							} else {
								notification.error({
									message: '??????',
									description: res.errorMsg
								});
							}
						});
					}
				}}
			/>
		);
	};

	const onFilter = (filterParams: any) => {
		if (filterParams.labels) {
			const {
				labels: { selectedKeys }
			} = filterParams;
			if (selectedKeys.length === 0) {
				setDataSource(originData);
			} else {
				let tempData = null;
				tempData = originData.filter((item) => {
					return item.labels?.severity === selectedKeys[0];
				});
				setDataSource(tempData);
			}
		} else if (filterParams.silence) {
			const {
				silence: { selectedKeys }
			} = filterParams;
			if (selectedKeys.length === 0) {
				setDataSource(originData);
			} else {
				let tempData = null;
				tempData = originData.filter((item) => {
					return item.silence === selectedKeys[0];
				});
				setDataSource(tempData);
			}
		} else if (filterParams.name) {
			const {
				name: { selectedKeys }
			} = filterParams;
			if (selectedKeys.length === 0) {
				setDataSource(originData);
			} else {
				let tempData = null;
				tempData = originData.filter((item) => {
					// console.log(item, selectedKeys[0]);
					return item.name === selectedKeys[0];
				});
				setDataSource(tempData);
			}
		}
	};

	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const dsTemp = dataSource.sort((a, b) => {
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

	if (!monitor || !monitor.alertManager) {
		return (
			<ComponentsNull title="??????????????????????????????????????????????????????????????????????????????>???????????????????????????" />
		);
	}

	if (customMid && !capabilities?.includes('alert')) {
		return <DefaultPicture />;
	}

	return (
		<ProTable
			dataSource={dataSource}
			// exact
			// fixedBarExpandWidth={[24]}
			// affixActionBar
			showRefresh
			showColumnSetting
			onRefresh={onRefresh}
			rowKey="key"
			search={{
				placeholder: '???????????????ID??????????????????????????????????????????',
				// onSearch: () => onRefresh(),
				onSearch: (value: string) => setSearchText(value),
				style: {
					width: '360px'
				}
			}}
			operation={Operation}
			// onSort={onSort}
			// onFilter={onFilter}
		>
			<ProTable.Column title="??????ID" dataIndex="alertId" width={100} />
			{
				alarmType === 'system' ? (
					<ProTable.Column
						filters={poolList}
						// filterMode="single"
						filterMultiple={false}
						onFilter={(value, record: ServiceRuleItem) =>
							value === record.name
						}
						render={nameRender}
						title="????????????"
						ellipsis
						dataIndex="nickname"
					/>
				) : null
				// (
				// 	<ProTable.Column
				// 		render={nameRender}
				// 		title="????????????"
				// 		ellipsis
				// 		dataIndex="name"
				// 	/>
				// )
			}
			<ProTable.Column
				title="????????????"
				dataIndex="threshold"
				render={ruleRender}
			/>
			<ProTable.Column
				title="????????????"
				dataIndex="labels"
				filters={alarmWarn}
				// filterMode="single"
				filterMultiple={false}
				onFilter={(value, record: ServiceRuleItem) =>
					value === record.labels?.severity
				}
				render={levelRender}
				width={100}
			/>
			<ProTable.Column
				title="????????????"
				dataIndex="silence"
				filters={silences}
				// filterMode="single"
				filterMultiple={false}
				onFilter={(value, record: ServiceRuleItem) =>
					value === record.silence
				}
				render={nullRender}
				width={100}
			/>
			<ProTable.Column
				title="????????????"
				dataIndex="content"
				width={110}
				render={nullRender}
			/>
			<ProTable.Column
				title="????????????"
				dataIndex="createTime"
				render={createTimeRender}
				// sortable
				sorter={(a: any, b: any) =>
					new Date(a.createTime).getTime() -
					new Date(b.createTime).getTime()
				}
				width={160}
			/>
			<ProTable.Column
				title="??????"
				dataIndex="enable"
				render={enableRender}
				width={100}
			/>
			<ProTable.Column
				title="??????"
				dataIndex="option"
				render={actionRender}
				width={100}
			/>
		</ProTable>
	);
}

export default Rules;
