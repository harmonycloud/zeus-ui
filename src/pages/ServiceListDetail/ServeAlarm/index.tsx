import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import moment from 'moment';
import { LinkButton, Actions } from '@alicloud/console-components-actions';
import { Button, Switch } from '@alifd/next';
import { useHistory } from 'react-router';
import { getClusters } from '@/services/common.js';
import { Message, Dialog } from '@alicloud/console-components';
import ComponentsNull from '@/components/ComponentsNull';
import DefaultPicture from '@/components/DefaultPicture';
import messageConfig from '@/components/messageConfig';
import { nullRender } from '@/utils/utils';
import { alarmWarn, silences } from '@/utils/const';
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
		// if (middlewareName && namespace) {
			getData(clusterId, middlewareName, namespace, searchText);
		// }
	};

	const createTimeRender = (value: string) => {
		if (!value) return '--';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	useEffect(() => {
		// if (middlewareName && namespace) {
			getData(clusterId, middlewareName, namespace, searchText);
		// }
	}, []);

	useEffect(() => {
		// if (clusterId && namespace && middlewareName) {
		getData(clusterId, middlewareName, namespace, searchText);
		// }
		getClusters().then((res) => {
			if (!res.data) return;
			setPoolList(
				res.data.map((item: any) => {
					return { label: item.id, value: item.id };
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
					Message.show(messageConfig('error', '失败', res));
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
					Message.show(messageConfig('error', '失败', res));
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
			Dialog.show({
				title: '操作确认',
				content: '是否确认删除?',
				onOk: () => {
					deleteAlarm(sendData).then((res) => {
						if (res.success) {
							// if (middlewareName && namespace) {
								getData(
									clusterId,
									middlewareName,
									namespace,
									''
								);
							// }
							Message.show(
								messageConfig('success', '成功', '删除成功')
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
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
			Dialog.show({
				title: '操作确认',
				content: '是否确认删除?',
				onOk: () => {
					deleteAlarms(sendData).then((res) => {
						if (res.success) {
							// if (middlewareName && namespace) {
								getData(
									clusterId,
									middlewareName,
									namespace,
									''
								);
							// }
							Message.show(
								messageConfig('success', '成功', '删除成功')
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					});
				}
			});
		}
	};

	const actionRender = (
		value: any,
		index: number,
		record: ServiceRuleItem
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
					编辑
				</LinkButton>
				<LinkButton onClick={() => removeAlarm(record)}>
					删除
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
				新增
			</Button>
		)
	};

	const ruleRender = (value: any, index: number, record: ServiceRuleItem) =>
		`${record.description}${record.symbol}${record.threshold}%且${
			record.alertTime || ''
		}分钟内触发${record.alertTimes || ''}次`;

	const levelRender = (value: any) => {
		const temp = alarmWarn.find((item) => item.value === value.severity);
		return (
			<span className={value?.severity + ' level'}>
				{value && temp ? temp?.label : ''}
			</span>
		);
	};

	const nameRender = (value: any, index: number, record: ServiceRuleItem) => {
		return alarmType === 'system'
			? record.labels?.clusterId
			: clusterId + '/' + namespace + '/' + type + '/' + middlewareName;
	};

	const enableRender = (
		value: string,
		index: number,
		record: ServiceRuleItem
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
								if (middlewareName && namespace) {
									getData(
										clusterId,
										middlewareName,
										namespace,
										''
									);
								}
								Message.show(
									messageConfig('success', '成功', '修改成功')
								);
							} else {
								Message.show(
									messageConfig(
										'error',
										'失败',
										res.errorMsg || '修改失败'
									)
								);
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
								// if (middlewareName && namespace) {
									getData(
										clusterId,
										middlewareName,
										namespace,
										''
									);
								// }
								Message.show(
									messageConfig('success', '成功', '修改成功')
								);
							} else {
								Message.show(
									messageConfig(
										'error',
										'失败',
										res.errorMsg || '修改失败'
									)
								);
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
			<ComponentsNull title="该功能所需要监控告警组件工具支持，您可前往“资源池——>平台组件“进行安装" />
		);
	}

	if (customMid && !capabilities?.includes('alert')) {
		return <DefaultPicture />;
	}

	return (
		<Table
			dataSource={dataSource}
			exact
			fixedBarExpandWidth={[24]}
			affixActionBar
			showRefresh
			showColumnSetting
			onRefresh={onRefresh}
			primaryKey="key"
			search={{
				placeholder: '请输入规则ID、告警规则、告警内容进行搜索',
				onSearch: () => onRefresh(),
				onChange: (value: string) => setSearchText(value),
				value: searchText
			}}
			searchStyle={{
				width: '360px'
			}}
			operation={Operation}
			onSort={onSort}
			onFilter={onFilter}
		>
			<Table.Column title="规则ID" dataIndex="alertId" />
			{alarmType === 'system' ? (
				<Table.Column
					filters={poolList}
					filterMode="single"
					cell={nameRender}
					title="告警对象"
					dataIndex="name"
				/>
			) : (
				<Table.Column
					cell={nameRender}
					title="告警对象"
					dataIndex="name"
				/>
			)}
			<Table.Column
				title="告警规则"
				dataIndex="threshold"
				cell={ruleRender}
			/>
			<Table.Column
				title="告警等级"
				dataIndex="labels"
				filters={alarmWarn}
				filterMode="single"
				cell={levelRender}
				width={120}
			/>
			<Table.Column
				title="告警间隔"
				dataIndex="silence"
				filters={silences}
				filterMode="single"
				cell={nullRender}
				width={120}
			/>
			<Table.Column
				title="告警内容"
				dataIndex="content"
				width={110}
				cell={nullRender}
			/>
			<Table.Column
				title="创建时间"
				dataIndex="createTime"
				cell={createTimeRender}
				sortable
				width={160}
			/>
			<Table.Column
				title="启用"
				dataIndex="enable"
				cell={enableRender}
				width={100}
			/>
			<Table.Column
				title="操作"
				dataIndex="option"
				cell={actionRender}
				width={100}
			/>
		</Table>
	);
}

export default Rules;
