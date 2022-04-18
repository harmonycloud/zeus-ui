import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	Table,
	Button,
	Search,
	Form,
	Input,
	Select,
	Message,
	Dialog,
	Icon
} from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { useParams } from 'react-router';
import HeaderLayout from '@/components/HeaderLayout';
import messageConfig from '@/components/messageConfig';

import { getConfigs, topParam, updateConfig } from '@/services/middleware';
import {
	nullRender,
	questionTooltipRender,
	tooltipRender
} from '@/utils/utils';
import { setParamTemplateConfig } from '@/redux/param/param';

import { ConfigItem } from '../../detail';
import { paramReduxProps, StoreState } from '@/types';
import { ParamsProps } from '../editParamTemplate';

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
				Message.show(messageConfig('error', '失败', res));
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
			Dialog.show({
				title: '操作确认',
				// content: '修改后可能导致服务重启，是否继续',
				content: restartFlag
					? '本次修改需要重启服务才能生效，可能导致业务中断，请谨慎操作'
					: '本次修改无需重启服务，参数将在提交后的15秒左右生效，请确认提交',
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
								Message.show(
									messageConfig(
										'success',
										'修改成功',
										`共修改了${sendData.data.customConfigList.length}个参数`
									)
								);
							} else {
								Message.show(
									messageConfig('error', '失败', res)
								);
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
	const onFilter = (filterParams: any) => {
		const {
			restart: { selectedKeys }
		} = filterParams;
		if (selectedKeys.length === 0) {
			setShowDataSource(dataSource);
		} else {
			const tempData = dataSource.filter(
				(item: ConfigItem) => item.restart + '' === selectedKeys[0]
			);
			setShowDataSource(tempData);
		}
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
			Message.show(
				messageConfig('error', '失败', '不能将目标值设置为空!')
			);
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
		index: number,
		record: ConfigItem
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
							pattern={record.pattern}
							patternMessage="输入的值不在参数范围中。"
						>
							<Input
								name={record.name}
								placeholder="请输入"
								defaultValue={record.modifiedValue}
								onChange={(value: string) => {
									updateValue(value, record);
								}}
							/>
						</FormItem>
					);
				case 'select':
					return (
						<FormItem>
							<Select
								style={{ width: '100%' }}
								name={record.name}
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
						<FormItem>
							<Select
								name={record.name}
								defaultValue={defaultSelects}
								mode="multiple"
								onChange={(value: any, actionType: string) => {
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
							pattern={record.pattern}
							patternMessage="输入的值不在参数范围中。"
						>
							<Input
								name={record.name}
								placeholder="请输入"
								defaultValue={record.modifiedValue}
								onChange={(value: string) => {
									updateValue(value, record);
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
					Message.show(
						messageConfig(
							'success',
							'成功',
							`参数${record.topping ? '取消置顶' : '置顶'}成功`
						)
					);
				} else {
					Message.show(
						messageConfig('error', '失败', '参数置顶失败')
					);
				}
			})
			.finally(() => {
				getData(clusterId, namespace, middlewareName, type);
			});
	};
	const actionRender = (value: string, index: number, record: ConfigItem) => {
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
	return (
		<div className="zeus-param-edit-table-content">
			<HeaderLayout
				style={{ marginBottom: 8 }}
				left={
					<>
						{editFlag === true && (
							<>
								<Button
									onClick={saveTemplate}
									className="mr-8"
									type="primary"
									disabled={disableFlag}
								>
									保存
								</Button>
								<Button
									className="mr-8"
									type="normal"
									onClick={() => {
										Dialog.show({
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
						)}
						{editFlag === false && (
							<Button
								className="mr-8"
								onClick={() => {
									handleBtnClick && handleBtnClick(true);
									setEditFlag(true);
								}}
								type="primary"
							>
								编辑
							</Button>
						)}
						<Search
							onSearch={handleSearch}
							hasClear
							style={{ width: '200px' }}
							placeholder="请输入关键词搜索"
						/>
					</>
				}
				right={
					source === 'list' ? (
						<Button
							disabled={editFlag}
							onClick={() => {
								setEditFlag(false);
								getData(
									clusterId,
									namespace,
									middlewareName,
									type,
									''
								);
							}}
						>
							<Icon type="refresh" />
						</Button>
					) : undefined
				}
			/>
			<Table
				dataSource={showDataSource}
				hasBorder={false}
				primaryKey="name"
				onFilter={onFilter}
				rowProps={onRowProps}
				onSort={onSort}
			>
				<Table.Column
					title="参数名"
					dataIndex="name"
					width={210}
					cell={(value: string, index: number, record: ConfigItem) =>
						tooltipRender(value, index, record, 210)
					}
					lock="left"
				/>
				<Table.Column
					title="默认值"
					dataIndex="defaultValue"
					cell={defaultValueRender}
					width={310}
				/>
				<Table.Column
					title="修改目标值"
					dataIndex="modifiedValue"
					cell={modifyValueRender}
					width={410}
				/>
				<Table.Column
					title="是否重启"
					dataIndex="restart"
					cell={isRestartRender}
					filterMode="single"
					filters={[
						{ value: 'true', label: '是' },
						{ value: 'false', label: '否' }
					]}
					width={120}
				/>
				<Table.Column
					title="参数值范围"
					dataIndex="ranges"
					cell={questionTooltipRender}
					width={100}
				/>
				<Table.Column
					title="参数描述"
					dataIndex="description"
					cell={questionTooltipRender}
					width={100}
				/>
				{source === 'list' && (
					<Table.Column
						title="修改时间"
						dataIndex="updateTime"
						cell={nullRender}
						sortable={true}
						width={150}
					/>
				)}
				{source === 'list' && (
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
						width={100}
					/>
				)}
			</Table>
		</div>
	);
}
const mapStateToProps = (state: StoreState) => ({
	param: state.param
});
export default connect(mapStateToProps, { setParamTemplateConfig })(
	ParamEditTable
);
