import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { connect } from 'react-redux';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import ProTable from '@/components/ProTable';
import {
	Input,
	Checkbox,
	notification,
	Form,
	Select,
	Button,
	Modal,
	Alert
} from 'antd';
import { getParamsTemp } from '@/services/template';
import { getConfigs, updateConfig } from '@/services/middleware';
import { globalVarProps, StoreState } from '@/types';
import { ConfigItem, ParamterTemplateItem } from '../detail';
import { questionTooltipRender } from '@/utils/utils';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { confirm } = Modal;
interface UseTemplateParams {
	middlewareName: string;
	type: string;
	uid: string;
	chartVersion: string;
	name: string;
	aliasName: string;
	namespace: string;
}
interface UseTemplateProps {
	globalVar: globalVarProps;
}
const FormItem = Form.Item;
const Option = Select.Option;
function UseTemplate(props: UseTemplateProps): JSX.Element {
	const {
		middlewareName,
		type,
		uid,
		chartVersion,
		name,
		aliasName,
		namespace
	}: UseTemplateParams = useParams();
	const history = useHistory();
	const {
		globalVar: {
			cluster: { id: clusterId }
		}
	} = props;
	const [checked, setChecked] = useState<boolean>(true);
	const [dataSource, setDataSource] = useState<ConfigItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<ConfigItem[]>([]);
	const [temp, setTemp] = useState<ParamterTemplateItem>();
	const [configs, setConfigs] = useState<ConfigItem[]>([]);
	const [searchText, setSearchText] = useState<string>('');
	useEffect(() => {
		if (clusterId) {
			getParamsTemp({ type, chartVersion, uid }).then((res) => {
				if (res.success) {
					setTemp(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
			getConfigs({ clusterId, namespace, middlewareName, type }).then(
				(res) => {
					if (res.success) {
						setConfigs(
							res.data.map((item: ConfigItem) => {
								item.modifiedValue =
									item.value || item.defaultValue;
								item.value = item.value || item.defaultValue;
								return item;
							})
						);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				}
			);
		}
	}, [clusterId]);
	useEffect(() => {
		if (temp && configs) {
			const list = configs;
			list.forEach((item) => {
				temp.customConfigList &&
					temp.customConfigList.map((i) => {
						if (i.name === item.name) {
							item[temp.name] = i.value;
							return item;
						}
					});
			});
			setDataSource(list);
		}
	}, [temp, configs]);
	useEffect(() => {
		if (checked) {
			const list = dataSource.filter(
				(item) => item[temp?.name || ''] !== item.value
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
	}, [dataSource]);
	const handleSearch = (value: string) => {
		const list = dataSource.filter((item) => item.name.includes(value));
		setShowDataSource(list);
		setSearchText(value);
	};
	const onChange = (e: CheckboxChangeEvent) => {
		if (e.target.checked) {
			const list = dataSource.filter(
				(item) => item[temp?.name || ''] !== item.value
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
		setSearchText('');
		setChecked(e.target.checked);
	};
	const onFilter = (filterParams: any) => {
		const {
			restart: { selectedKeys }
		} = filterParams;
		let list = dataSource;
		if (selectedKeys.length === 0) {
			if (checked)
				list = list.filter(
					(item) => item[temp?.name || ''] !== item.value
				);
			setShowDataSource(list);
		} else {
			let tempData = dataSource.filter(
				(item: ConfigItem) => item.restart + '' === selectedKeys[0]
			);
			if (checked)
				tempData = tempData.filter(
					(item) => item[temp?.name || ''] !== item.value
				);
			setShowDataSource(tempData);
		}
	};
	const isRestartRender = (value: boolean) => {
		return value ? '是' : '否';
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
				description: '不能将目标值设置为空!'
			});
			return;
		}
		if (record.paramType === 'multiSelect') {
			record[temp?.name || ''] = value.join(',');
			record.modifiedValue = value.join(',');
		} else {
			record[temp?.name || ''] = value;
			record.modifiedValue = value;
		}
		setDataSource([...dataSource]);
		setShowDataSource([...showDataSource]);
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
			const arr1 = record[temp?.name || ''].split(',');
			defaultSelects = [...arr1];
		}
		switch (record.paramType) {
			case 'input':
				return (
					<FormItem
						name={record.name}
						rules={[
							{
								pattern: new RegExp(record.pattern as string),
								message: '输入的值不在参数范围中'
							}
						]}
						noStyle
					>
						<Input
							placeholder="请输入"
							defaultValue={record[temp?.name || '']}
							onChange={(e) => {
								updateValue(e.target.value, record);
							}}
						/>
					</FormItem>
				);
			case 'select':
				return (
					<FormItem name={record.name} noStyle>
						<Select
							style={{ width: '100%' }}
							defaultValue={record[temp?.name || '']}
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
					<FormItem name={record.name} noStyle>
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
								pattern: new RegExp(record.pattern as string),
								message: '输入的值不在参数范围中'
							}
						]}
						noStyle
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
	};
	const confirmUse = () => {
		const list = dataSource.filter(
			(item) => item.value != item[temp?.name || '']
		);
		if (list.length === 0) {
			notification.error({
				message: '失败',
				description: '当前模版已启用，无差异值。'
			});
			return;
		}
		const restartFlag = list.some((item) => {
			if (item.restart === true) return true;
			return false;
		});
		confirm({
			title: '操作确认',
			content: restartFlag
				? '本次使用模版需要重启服务才能生效，可能导致业务中断，请谨慎操作'
				: '本次使用模版无需重启服务，参数将在提交后的15秒左右生效，请确认提交',
			onOk: () => {
				list.forEach((item) => {
					item.value = item[temp?.name || ''];
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
						customConfigList: list
					}
				};
				// console.log(sendData);
				return updateConfig(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '修改成功',
							description: `共修改了${sendData.data.customConfigList.length}个参数`
						});
						history.push(
							`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}/${namespace}`
						);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};
	return (
		<ProPage>
			<ProHeader
				title="使用参数模版"
				// hasBackArrow
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Alert
					showIcon
					message="使用前模板需要修改当前运行值，可直接修改应用当前模板，并确认应用后仅本次生效！"
					type="warning"
				/>
				<div className="title-content" style={{ marginTop: 24 }}>
					<div className="blue-line"></div>
					<div className="detail-title">参数对比</div>
				</div>
				<ProTable
					dataSource={showDataSource}
					rowKey="name"
					search={{
						value: searchText,
						onSearch: handleSearch,
						onChange: (e) => setSearchText(e.target.value),
						style: { width: '200px' },
						placeholder: '请输入关键字内容'
					}}
					pagination={false}
					operation={{
						secondary: (
							<Checkbox onChange={onChange} checked={checked}>
								只看差异值
							</Checkbox>
						)
					}}
					style={{ marginBottom: 64 }}
				>
					<ProTable.Column
						title="参数名"
						dataIndex="name"
						width={210}
						ellipsis={true}
						fixed="left"
					/>
					<ProTable.Column
						title="当前运行值"
						dataIndex="value"
						ellipsis={true}
						width={180}
					/>
					<ProTable.Column
						title="模版值"
						dataIndex={temp?.name}
						render={modifyValueRender}
						width={310}
					/>
					<ProTable.Column
						title="默认值"
						dataIndex="defaultValue"
						ellipsis={true}
						width={180}
					/>
					<ProTable.Column
						title="是否重启"
						dataIndex="restart"
						render={isRestartRender}
						filterMultiple={false}
						filters={[
							{ value: 'true', text: '是' },
							{ value: 'false', text: '否' }
						]}
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
						width={80}
					/>
				</ProTable>
				<div
					className="zeus-edit-param-summit-btn zeus-edit-param-summit-btn-fix"
					style={{ paddingTop: 16 }}
				>
					<Button type="primary" onClick={confirmUse}>
						确认使用
					</Button>
					<Button
						type="default"
						onClick={() => {
							window.history.back();
						}}
					>
						取消
					</Button>
				</div>
			</ProContent>
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(UseTemplate);
