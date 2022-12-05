import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams, useHistory } from 'react-router';
import moment from 'moment';
import { Button, Input, Form, Select, notification, Modal } from 'antd';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';

import { getConfigs, topParam, updateConfig } from '@/services/middleware';
import { nullRender, questionTooltipRender } from '@/utils/utils';
import { setParamTemplateConfig } from '@/redux/param/param';

import { ConfigItem } from '../../detail';
import { paramReduxProps, StoreState } from '@/types';
import { ParamsProps } from '../editParamTemplate';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
interface ParamEditTableProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	param: paramReduxProps;
	source?: string;
	handleBtnClick?: (value: boolean) => void;
	setParamTemplateConfig: (value: ConfigItem[]) => void;
}

function ParamEditTable(props: ParamEditTableProps): JSX.Element {
	const {
		param,
		clusterId,
		namespace,
		middlewareName,
		type,
		handleBtnClick,
		source = 'template',
		setParamTemplateConfig
	} = props;
	const { uid, currentTab, aliasName, name, chartVersion }: ParamsProps =
		useParams();
	const history = useHistory();
	const [dataSource, setDataSource] = useState<ConfigItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<ConfigItem[]>([]);
	const [editFlag, setEditFlag] = useState<boolean>(false);
	const [disableFlag, setDisableFlag] = useState<boolean>(true);
	useEffect(() => {
		if (source === 'template') {
			if (param.customConfigList.length === 0) {
				if (clusterId && namespace && middlewareName && type) {
					getData(clusterId, namespace, middlewareName, type);
				}
			} else {
				setDataSource(param.customConfigList);
				setShowDataSource(param.customConfigList);
			}
			if (uid) {
				const list = param.customConfigList.map((item: ConfigItem) => {
					item.modifiedValue =
						item.modifiedValue || item.value || item.defaultValue;
					item.value = item.value || item.defaultValue;
					return item;
				});
				setDataSource(list);
				setShowDataSource(list);
			}
		} else {
			if (clusterId && namespace && middlewareName && type) {
				getData(clusterId, namespace, middlewareName, type);
			}
		}
	}, [props]);
	useEffect(() => {
		setEditFlag(false);
	}, [currentTab]);
	const getData = (
		clusterId: string,
		namespace: string,
		middlewareName: string,
		type: string,
		order = 'descend'
	) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			type,
			order
		};
		getConfigs(sendData).then((res) => {
			if (res.success) {
				const list =
					res.data &&
					res.data.map((item: ConfigItem) => {
						item.modifiedValue = item.value || item.defaultValue;
						item.value = item.value || item.defaultValue;
						return item;
					});
				setDataSource(list);
				setShowDataSource(list);
				source === 'template' && setParamTemplateConfig(list);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const saveTemplate = () => {
		if (source === 'template') {
			setParamTemplateConfig(dataSource);
			handleBtnClick && handleBtnClick(false);
		} else {
			const list = dataSource.filter(
				(item) => item.value != item.modifiedValue
			);
			const restartFlag = list.some((item) => {
				if (item.restart === true) return true;
				return false;
			});
			confirm({
				title: '重启提示',
				content: restartFlag
					? '当前修改参数中包括需要重启才能生效的参数，建议立即前往实例详情页进行手动重启'
					: '本次修改无需重启服务，参数将在提交后的15秒左右生效，请确认提交',
				okText:
					(restartFlag && type === 'redis') ||
					(restartFlag && type === 'postgresql')
						? '立即前往'
						: '确认',
				cancelText:
					(restartFlag && type === 'redis') ||
					(restartFlag && type === 'postgresql')
						? '暂不重启'
						: '取消',
				onOk: () => {
					const sendList = list.map((item) => {
						item.value = item.modifiedValue;
						return item;
					});
					const sendData = {
						url: {
							clusterId,
							middlewareName,
							namespace
						},
						data: {
							clusterId,
							middlewareName,
							namespace,
							type,
							customConfigList: sendList
						}
					};
					updateConfig(sendData)
						.then((res) => {
							if (res.success) {
								notification.success({
									message: '修改成功',
									description: `共修改了${sendData.data.customConfigList.length}个参数`
								});
								if (
									(restartFlag && type === 'redis') ||
									(restartFlag && type === 'postgresql')
								) {
									history.push(
										`/serviceList/${name}/${aliasName}/highAvailability/${middlewareName}/${type}/${chartVersion}/${namespace}`
									);
								}
							} else {
								notification.error({
									message: '失败',
									description: res.errorMsg
								});
							}
						})
						.finally(() => {
							getData(clusterId, namespace, middlewareName, type);
						});
				},
				onCancel: () => {
					if (
						(restartFlag && type === 'redis') ||
						(restartFlag && type === 'postgresql')
					) {
						const sendList = list.map((item) => {
							item.value = item.modifiedValue;
							return item;
						});
						const sendData = {
							url: {
								clusterId,
								middlewareName,
								namespace
							},
							data: {
								clusterId,
								middlewareName,
								namespace,
								type,
								customConfigList: sendList
							}
						};
						updateConfig(sendData)
							.then((res) => {
								if (res.success) {
									notification.success({
										message: '修改成功',
										description: `共修改了${sendData.data.customConfigList.length}个参数`
									});
								} else {
									notification.error({
										message: '失败',
										description: res.errorMsg
									});
								}
							})
							.finally(() => {
								getData(
									clusterId,
									namespace,
									middlewareName,
									type
								);
							});
					}
				}
			});
		}
		setEditFlag(false);
	};
	const handleSearch = (value: string) => {
		const list = dataSource.filter((item) => item.name.includes(value));
		setShowDataSource(list);
	};
	const isRestartRender = (value: boolean) => {
		return value ? '是' : '否';
	};
	const defaultValueRender = (value: string) => {
		return (
			<div
				title={value}
				style={{ width: '100%' }}
				className="text-overflow"
			>
				{value}
			</div>
		);
	};
	const updateValue = (value: any, record: ConfigItem) => {
		let cValue = value;
		if (record.paramType === 'multiSelect') {
			cValue = value.join(',');
		}
		const flag = typeof cValue === 'string' && cValue.trim();
		if (flag === null || flag === undefined || flag === '') {
			notification.error({
				message: '失败',
				description: '不能将目标值设置为空'
			});
			return;
		}
		if (record.paramType === 'multiSelect') {
			record.modifiedValue = value.join(',');
		} else {
			record.modifiedValue = value;
		}
		setDataSource([...dataSource]);
		setShowDataSource([...showDataSource]);
		const list = dataSource.filter(
			(item) => item.value != item.modifiedValue
		);
		if (list.length === 0) {
			setDisableFlag(true);
		} else {
			setDisableFlag(false);
		}
	};
	const modifyValueRender = (
		value: string,
		record: ConfigItem,
		index: number
	) => {
		let selectList: string[] = [];
		let defaultSelects: string[] = [];
		if (
			record.paramType === 'select' ||
			record.paramType === 'multiSelect'
		) {
			let selects: string;
			if (record.ranges.includes('"')) {
				selects = record.ranges.substring(2, record.ranges.length - 2);
			} else {
				selects = record.ranges.substring(1, record.ranges.length - 1);
			}
			const listTemp = selects.split('|');
			selectList = listTemp;
		}
		if (record.paramType === 'multiSelect') {
			const arr1 = record.modifiedValue.split(',');
			defaultSelects = [...arr1];
		}
		if (editFlag) {
			switch (record.paramType) {
				case 'input':
					return (
						<FormItem
							name={record.name}
							rules={[
								{
									pattern: new RegExp(String(record.pattern)),
									message: '输入的值不在参数范围中。'
								}
							]}
							noStyle
							// initialValue={record.modifiedValue}
						>
							<Input
								placeholder="请输入"
								defaultValue={record.modifiedValue}
								onChange={(e) => {
									updateValue(e.target.value, record);
								}}
							/>
						</FormItem>
					);
				case 'select':
					return (
						<FormItem
							name={record.name}
							noStyle
							// initialValue={record.modifiedValue}
						>
							<Select
								style={{ width: '100%' }}
								defaultValue={record.modifiedValue}
								onChange={(value: any) => {
									updateValue(value, record);
								}}
								dropdownMatchSelectWidth={false}
							>
								{selectList &&
									selectList.map((item) => {
										return (
											<Option key={item} value={item}>
												{item}
											</Option>
										);
									})}
							</Select>
						</FormItem>
					);
				case 'multiSelect':
					return (
						<FormItem
							name={record.name}
							noStyle
							// initialValue={defaultSelects}
						>
							<Select
								defaultValue={defaultSelects}
								mode="multiple"
								onChange={(value: any) => {
									updateValue(value, record);
								}}
								dropdownMatchSelectWidth={false}
							>
								{selectList &&
									selectList.map((item) => {
										return (
											<Option key={item} value={item}>
												{item}
											</Option>
										);
									})}
							</Select>
						</FormItem>
					);
				default:
					return (
						<FormItem
							name={record.name}
							rules={[
								{
									pattern: new RegExp(String(record.pattern)),
									message: '输入的值不在参数范围中。'
								}
							]}
							noStyle
							// initialValue={record.modifiedValue}
						>
							<Input
								placeholder="请输入"
								defaultValue={record.modifiedValue}
								onChange={(e) => {
									updateValue(e.target.value, record);
								}}
							/>
						</FormItem>
					);
			}
		} else {
			const flag = record.value != record.modifiedValue;
			return (
				<div
					title={value}
					style={{
						width: '100%',
						color: flag ? '#C80000' : '#333333'
					}}
					className="text-overflow"
				>
					{value}
				</div>
			);
		}
	};
	const topConfigParam = (record: ConfigItem) => {
		const sendData = {
			clusterId,
			namespace,
			type,
			middlewareName,
			configName: record.name
		};
		topParam(sendData)
			.then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: `参数${
							record.topping ? '取消置顶' : '置顶'
						}成功`
					});
				} else {
					notification.error({
						message: '失败',
						description: '参数置顶失败'
					});
				}
			})
			.finally(() => {
				getData(clusterId, namespace, middlewareName, type);
			});
	};
	const actionRender = (value: string, record: ConfigItem, index: number) => {
		return (
			<Actions>
				{record.topping && (
					<LinkButton
						disabled={editFlag}
						onClick={() => topConfigParam(record)}
					>
						取消置顶
					</LinkButton>
				)}
				{!record.topping && (
					<LinkButton
						disabled={editFlag}
						onClick={() => topConfigParam(record)}
					>
						置顶
					</LinkButton>
				)}
			</Actions>
		);
	};
	const onSort = (dataIndex: string, order: string) => {
		const o = order === 'desc' ? 'descend' : 'ascend';
		getData(clusterId, namespace, middlewareName, type, o);
	};
	const onRowProps = (record: ConfigItem) => {
		if ((source === 'list' && record.topping) || editFlag) {
			return { style: { background: '#F8F8F9' } };
		}
	};
	const operation = () => {
		if (editFlag) {
			return {
				primary: (
					<>
						<Button
							onClick={saveTemplate}
							type="primary"
							disabled={disableFlag}
						>
							保存
						</Button>
						<Button
							onClick={() => {
								confirm({
									title: '操作确认',
									content:
										'取消后，编辑后数据将会丢失，请谨慎操作',
									onOk: () => {
										getData(
											clusterId,
											namespace,
											middlewareName,
											type
										);
										setTimeout(() => {
											setEditFlag(false);
											setDisableFlag(true);
											handleBtnClick &&
												handleBtnClick(false);
										}, 1000);
									}
								});
							}}
						>
							取消
						</Button>
					</>
				)
			};
		} else {
			return {
				primary: (
					<Button
						onClick={() => {
							handleBtnClick && handleBtnClick(true);
							setEditFlag(true);
						}}
						type="primary"
					>
						编辑
					</Button>
				)
			};
		}
	};
	return (
		<ProTable
			dataSource={showDataSource}
			rowKey="name"
			operation={operation()}
			search={{
				onSearch: handleSearch,
				style: { width: '200px' },
				placeholder: '请输入关键词搜索'
			}}
			showColumnSetting
			showRefresh
			refreshDisabled={editFlag}
			onRefresh={() => {
				setEditFlag(false);
				getData(clusterId, namespace, middlewareName, type, '');
			}}
			pagination={false}
			scroll={{ x: 1500 }}
			rowClassName={(record) => {
				if ((source === 'list' && record.topping) || editFlag) {
					return 'table-row-topping';
				}
				return '';
			}}
		>
			<ProTable.Column
				title="参数名"
				dataIndex="name"
				width={210}
				ellipsis={true}
				fixed="left"
			/>
			<ProTable.Column
				title="默认值"
				dataIndex="defaultValue"
				render={defaultValueRender}
				width={310}
			/>
			<ProTable.Column
				title="目标值"
				dataIndex="modifiedValue"
				render={modifyValueRender}
				width={410}
			/>
			<ProTable.Column
				title="是否重启"
				dataIndex="restart"
				render={isRestartRender}
				filterMultiple={false}
				filters={[
					{ value: true, text: '是' },
					{ value: false, text: '否' }
				]}
				onFilter={(value, record: ConfigItem) =>
					record.restart === value
				}
				width={120}
			/>
			<ProTable.Column
				title="参数值范围"
				dataIndex="ranges"
				render={questionTooltipRender}
				width={100}
			/>
			<ProTable.Column
				title="参数描述"
				dataIndex="description"
				render={questionTooltipRender}
				width={100}
			/>
			{source === 'list' && (
				<ProTable.Column
					title="修改时间"
					dataIndex="updateTime"
					render={nullRender}
					sorter={(a: ConfigItem, b: ConfigItem) =>
						moment(a.updateTime).unix() -
						moment(b.updateTime).unix()
					}
					width={150}
				/>
			)}
			{source === 'list' && (
				<ProTable.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
					width={100}
				/>
			)}
		</ProTable>
	);
}
const mapStateToProps = (state: StoreState) => ({
	param: state.param
});
export default connect(mapStateToProps, { setParamTemplateConfig })(
	ParamEditTable
);
