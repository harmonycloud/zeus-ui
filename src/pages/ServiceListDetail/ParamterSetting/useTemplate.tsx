import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { Page, Content, Header } from '@alicloud/console-components-page';
import {
	Search,
	Table,
	Checkbox,
	Message,
	Form,
	Input,
	Select,
	Button,
	Dialog
} from '@alicloud/console-components';
import HeaderLayout from '@/components/HeaderLayout';
import { getParamsTemp } from '@/services/template';
import { getConfigs, updateConfig } from '@/services/middleware';
import { globalVarProps, StoreState } from '@/types';
import { connect } from 'react-redux';
import { ConfigItem, ParamterTemplateItem } from '../detail';
import {
	defaultValueRender,
	questionTooltipRender,
	tooltipRender
} from '@/utils/utils';
import messageConfig from '@/components/messageConfig';

interface UseTemplateParams {
	middlewareName: string;
	type: string;
	uid: string;
	chartVersion: string;
	name: string;
	aliasName: string;
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
		aliasName
	}: UseTemplateParams = useParams();
	const history = useHistory();
	const {
		globalVar: {
			cluster: { id: clusterId },
			namespace: { name: namespace }
		}
	} = props;
	const [checked, setChecked] = useState<boolean>(true);
	const [dataSource, setDataSource] = useState<ConfigItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<ConfigItem[]>([]);
	const [temp, setTemp] = useState<ParamterTemplateItem>();
	const [configs, setConfigs] = useState<ConfigItem[]>([]);
	const [searchText, setSearchText] = useState<string>('');
	useEffect(() => {
		if (clusterId && namespace) {
			getParamsTemp({ type, chartVersion, uid }).then((res) => {
				if (res.success) {
					setTemp(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
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
						Message.show(messageConfig('error', '失败', res));
					}
				}
			);
		}
	}, [clusterId, namespace]);
	useEffect(() => {
		if (temp && configs) {
			const list = configs;
			list.forEach((item) => {
				temp.customConfigList?.map((i) => {
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
	const onChange = (value: boolean) => {
		if (value) {
			const list = dataSource.filter(
				(item) => item[temp?.name || ''] !== item.value
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
		setSearchText('');
		setChecked(value);
	};
	const onFilter = (filterParams: any) => {
		const {
			restart: { selectedKeys }
		} = filterParams;
		let list = dataSource;
		if (selectedKeys.length === 0) {
			list = list.filter((item) => item[temp?.name || ''] !== item.value);
			setShowDataSource(list);
		} else {
			let tempData = dataSource.filter(
				(item: ConfigItem) => item.restart + '' === selectedKeys[0]
			);
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
			Message.show(
				messageConfig('error', '失败', '不能将目标值设置为空!')
			);
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
			const arr1 = record[temp?.name || ''].split(',');
			defaultSelects = [...arr1];
		}
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
							defaultValue={record[temp?.name || '']}
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
	};
	const confirmUse = () => {
		const list = dataSource.filter(
			(item) => item.value != item[temp?.name || '']
		);
		if (list.length === 0) {
			Message.show(
				messageConfig('error', '失败', '当前模版已启用，无差异值。')
			);
			return;
		}
		const restartFlag = list.some((item) => {
			if (item.restart === true) return true;
			return false;
		});
		Dialog.show({
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
						Message.show(
							messageConfig(
								'success',
								'修改成功',
								`共修改了${sendData.data.customConfigList.length}个参数`
							)
						);
						history.push(
							`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}`
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};
	return (
		<Page>
			<Header
				title="使用参数模版"
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Message type="warning">
					使用前模板需要修改当前运行值，可直接修改应用当前模板，并确认应用后仅本次生效！
				</Message>
				<div className="title-content" style={{ marginTop: 24 }}>
					<div className="blue-line"></div>
					<div className="detail-title">参数对比</div>
				</div>
				<HeaderLayout
					style={{ marginBottom: 8 }}
					left={
						<Search
							value={searchText}
							onSearch={handleSearch}
							onChange={(value: string) => setSearchText(value)}
							hasClear
							style={{ width: '200px' }}
							placeholder="请输入关键字内容"
						/>
					}
					right={
						<Checkbox
							onChange={onChange}
							checked={checked}
							label="只看差异值"
						/>
					}
				/>
				<Table
					dataSource={showDataSource}
					hasBorder={false}
					primaryKey="name"
					onFilter={onFilter}
				>
					<Table.Column
						title="参数名"
						dataIndex="name"
						width={210}
						cell={(
							value: string,
							index: number,
							record: ConfigItem
						) => tooltipRender(value, index, record, 210)}
						lock="left"
					/>
					<Table.Column
						title="当前运行值"
						dataIndex="value"
						cell={defaultValueRender}
						width={180}
					/>
					<Table.Column
						title="模版值"
						dataIndex={temp?.name}
						cell={modifyValueRender}
						width={310}
					/>
					<Table.Column
						title="默认值"
						dataIndex="defaultValue"
						cell={defaultValueRender}
						width={180}
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
						width={80}
					/>
				</Table>
				<div
					className="zeus-edit-param-summit-btn zeus-edit-param-summit-btn-fix"
					style={{ paddingTop: 16 }}
				>
					<Button type="primary" onClick={confirmUse}>
						确认使用
					</Button>
					<Button
						type="normal"
						onClick={() => {
							window.history.back();
						}}
					>
						取消
					</Button>
				</div>
			</Content>
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(UseTemplate);
