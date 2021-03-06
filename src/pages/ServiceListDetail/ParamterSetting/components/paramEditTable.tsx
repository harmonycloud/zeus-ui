import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router';
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
	const { uid, currentTab }: ParamsProps = useParams();
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
					message: '??????',
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
				title: '????????????',
				content: restartFlag
					? '???????????????????????????????????????????????????????????????????????????????????????'
					: '?????????????????????????????????????????????????????????15?????????????????????????????????',
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
									message: '????????????',
									description: `????????????${sendData.data.customConfigList.length}?????????`
								});
							} else {
								notification.error({
									message: '??????',
									description: res.errorMsg
								});
							}
						})
						.finally(() => {
							getData(clusterId, namespace, middlewareName, type);
						});
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
		return value ? '???' : '???';
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
				message: '??????',
				description: '??????????????????????????????'
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
			const selects = record.ranges.substring(
				2,
				record.ranges.length - 2
			);
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
									message: '????????????????????????????????????'
								}
							]}
							noStyle
							// initialValue={record.modifiedValue}
						>
							<Input
								placeholder="?????????"
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
									message: '????????????????????????????????????'
								}
							]}
							noStyle
							// initialValue={record.modifiedValue}
						>
							<Input
								placeholder="?????????"
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
						message: '??????',
						description: `??????${
							record.topping ? '????????????' : '??????'
						}??????`
					});
				} else {
					notification.error({
						message: '??????',
						description: '??????????????????'
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
						????????????
					</LinkButton>
				)}
				{!record.topping && (
					<LinkButton
						disabled={editFlag}
						onClick={() => topConfigParam(record)}
					>
						??????
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
							??????
						</Button>
						<Button
							onClick={() => {
								confirm({
									title: '????????????',
									content:
										'?????????????????????????????????????????????????????????',
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
							??????
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
						??????
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
				placeholder: '????????????????????????'
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
				title="?????????"
				dataIndex="name"
				width={210}
				ellipsis={true}
				fixed="left"
			/>
			<ProTable.Column
				title="?????????"
				dataIndex="defaultValue"
				render={defaultValueRender}
				width={310}
			/>
			<ProTable.Column
				title="???????????????"
				dataIndex="modifiedValue"
				render={modifyValueRender}
				width={410}
			/>
			<ProTable.Column
				title="????????????"
				dataIndex="restart"
				render={isRestartRender}
				filterMultiple={false}
				filters={[
					{ value: true, text: '???' },
					{ value: false, text: '???' }
				]}
				onFilter={(value, record: ConfigItem) =>
					record.restart === value
				}
				width={120}
			/>
			<ProTable.Column
				title="???????????????"
				dataIndex="ranges"
				render={questionTooltipRender}
				width={100}
			/>
			<ProTable.Column
				title="????????????"
				dataIndex="description"
				render={questionTooltipRender}
				width={100}
			/>
			{source === 'list' && (
				<ProTable.Column
					title="????????????"
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
					title="??????"
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
