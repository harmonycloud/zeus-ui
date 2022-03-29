import React, { useState, useEffect } from 'react';
import { Page, Content } from '@alicloud/console-components-page';
import {
	Button,
	Table,
	Checkbox,
	Form,
	Icon,
	Input,
	Message,
	Dialog,
	Select,
	Balloon,
	Search
} from '@alicloud/console-components';
import { useParams } from 'react-router';
import HeaderLayout from '@/components/HeaderLayout';
import BalloonForm from '@/components/BalloonForm';
import ParamterTemplateForm from './paramterTemplateForm';
import messageConfig from '@/components/messageConfig';
import { getConfigs, updateConfig } from '@/services/middleware';
import {
	ParamterListProps,
	ConfigItem,
	DetailParams,
	ConfigSendData
} from '../detail';

const { Option } = Select;
const FormItem = Form.Item;
const Tooltip = Balloon.Tooltip;
const formItemLayout = {
	labelCol: { fixedSpan: 0 },
	wrapperCol: { span: 24 }
};
export default function ParamterList(props: ParamterListProps): JSX.Element {
	const { clusterId, namespace, middlewareName, type, onFreshChange } = props;
	const [dataSource, setDataSource] = useState<ConfigItem[]>([]);
	const [checkedDataSource, setCheckedDataSource] = useState<ConfigItem[]>(
		[]
	);
	const [originData, setOriginData] = useState<ConfigItem[]>([]);
	const [checked, setChecked] = useState<boolean>(false);
	const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);
	const [visible, setVisible] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>('');
	const params: DetailParams = useParams();
	useEffect(() => {
		const list = dataSource.filter(
			(item) => item.value != item.modifiedValue
		);
		setCheckedDataSource(list);
	}, [dataSource]);
	useEffect(() => {
		const list = originData.filter((item) =>
			item.name.includes(searchText)
		);
		setDataSource(list);
	}, [searchText]);
	useEffect(() => {
		if (clusterId && namespace && middlewareName && type) {
			getData(clusterId, namespace, middlewareName, type);
		}
	}, [namespace]);

	const getData = (
		clusterId: string,
		namespace: string,
		middlewareName: string,
		type: string
	) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			type
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
			}
		});
	};
	const onSearch = (value: string) => {
		setSearchText(value);
	};

	const onChange = (checked: boolean) => {
		setChecked(checked);
	};

	const isRestartRender = (
		value: boolean,
		index: number,
		record: ConfigItem
	) => {
		return record.restart ? '是' : '否';
	};

	const handleSubmit = () => {
		const list = dataSource.filter(
			(item) => item.value != item.modifiedValue
		);
		const restartFlag = list.some((item) => {
			if (item.restart === true) return true;
			return false;
		});
		if (restartFlag) {
			Dialog.show({
				title: '修改参数',
				content:
					'本次修改需要重启服务才能生效，可能导致业务中断，请谨慎操作',
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
					updateData(sendData);
				},
				onCancel: () => {
					setSubmitDisabled(judgeSubmit());
				}
			});
		} else {
			Dialog.show({
				title: '修改参数',
				content:
					'本次修改无需重启服务，参数将在提交后的15秒左右生效，请确认提交',
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
					updateData(sendData);
				},
				onCancel: () => {
					setSubmitDisabled(judgeSubmit());
				}
			});
		}
	};

	const updateData = (data: ConfigSendData) => {
		updateConfig(data)
			.then((res) => {
				if (res.success) {
					Message.show(
						messageConfig(
							'success',
							'修改成功',
							`共修改了${data.data.customConfigList.length}个参数`
						)
					);
					onFreshChange();
					setSubmitDisabled(judgeSubmit());
				} else {
					Message.show(messageConfig('error', '失败', res));
					setSubmitDisabled(judgeSubmit());
				}
			})
			.finally(() => {
				getData(clusterId, namespace, middlewareName, type);
			});
	};

	const handleCancel = () => {
		Dialog.show({
			title: '确认操作',
			content: '该操作会重置当前所有已编辑的内容，请确认是否执行',
			onOk: () => {
				const list = dataSource.map((item) => {
					item.modifiedValue = item.value;
					return item;
				});
				setDataSource(list);
				setSubmitDisabled(judgeSubmit());
			}
		});
	};

	const judgeSubmit = () => {
		const flag = dataSource.every((item) => {
			if (item.value == item.modifiedValue) return true;
			return false;
		});
		return flag;
	};

	const updateValue = (value: any, record: ConfigItem) => {
		let cValue = value[record.name];
		if (record.paramType === 'multiSelect') {
			cValue = value[record.name].join(',');
		}
		const flag = cValue.trim();
		if (flag === null || flag === undefined || flag === '') {
			Message.show(
				messageConfig('error', '失败', '不能将目标值设置为空!')
			);
			return;
		}
		if (record.paramType === 'multiSelect') {
			record.modifiedValue = value[record.name].join(',');
		} else {
			record.modifiedValue = value[record.name];
		}
		setDataSource([...dataSource]);
		setSubmitDisabled(judgeSubmit());
	};

	const selectTemplate = (values: ConfigItem[]) => {
		const list = dataSource.map((item) => {
			values.map((it: ConfigItem) => {
				if (item.name === it.name) {
					item.modifiedValue = it.value;
				}
			});
			return item;
		});
		setDataSource(list);
		setSubmitDisabled(judgeSubmit());
		setVisible(false);
	};
	const descriptionRender = (value: string) => {
		return (
			<Tooltip
				trigger={
					<span
						className="table-col-w146-h2"
						onClick={() => {
							const dialog = Dialog.show({
								title: '参数描述',
								content: (
									<div
										style={{
											maxWidth: '560px',
											lineHeight: '16px'
										}}
									>
										{value}
									</div>
								),
								footer: (
									<Button
										type="primary"
										onClick={() => dialog.hide()}
									>
										确认
									</Button>
								)
							});
						}}
					>
						{value}
					</span>
				}
				align="t"
			>
				{value}
			</Tooltip>
		);
	};
	const tooltipRender = (
		value: string,
		index: number,
		record: ConfigItem,
		width: number
	) => {
		const e1 = document.createElement('div');
		e1.className = 'hidden';
		e1.innerText = value;
		document.body.appendChild(e1);
		if (e1.clientWidth > width) {
			document.body.removeChild(e1);
			return (
				<Tooltip
					trigger={
						<div
							className="mid-table-col"
							style={{ width: `${width - 32}px` }}
						>
							{value}
						</div>
					}
					align="t"
				>
					<span style={{ lineHeight: '16px' }}>{value}</span>
				</Tooltip>
			);
		} else {
			document.body.removeChild(e1);
			return (
				<div
					className="mid-table-col"
					style={{ width: `${width - 32}px` }}
				>
					{value}
				</div>
			);
		}
	};

	const valueRender = (value: string, index: number, record: ConfigItem) => {
		const flag = record.value != record.modifiedValue;
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
		return (
			<div className="parameter-content">
				<span className={flag ? 'updated-value' : 'before-update'}>
					{value}
				</span>
				<BalloonForm
					closable={false}
					trigger={
						<Icon className="edit-icon" type="edit" size="xs" />
					}
					style={{ width: '300px' }}
					onConfirm={(v) => updateValue(v, record)}
					formProps={formItemLayout}
				>
					{record.paramType === 'input' && (
						<FormItem
							pattern={record.pattern}
							patternMessage="输入的值不在参数范围中。"
						>
							<Input
								name={record.name}
								placeholder="请输入"
								defaultValue={record.modifiedValue}
							/>
							<p>输入范围:{record.ranges}</p>
							<Message title="修改提示" type="warning">
								编辑完成后，需点击“提交修改”方能正式生效
							</Message>
						</FormItem>
					)}
					{record.paramType === 'select' && (
						<FormItem>
							<Select
								name={record.name}
								defaultValue={record.modifiedValue}
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
							<p>输入范围:{record.ranges}</p>
							<Message title="修改提示" type="warning">
								编辑完成后，需点击“提交修改”方能正式生效
							</Message>
						</FormItem>
					)}
					{record.paramType === 'multiSelect' && (
						<FormItem>
							<Select
								name={record.name}
								defaultValue={defaultSelects}
								mode="multiple"
								style={{ width: '268px' }}
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
							<p>输入范围:{record.ranges}</p>
							<Message title="修改提示" type="warning">
								编辑完成后，需点击“提交修改”方能正式生效
							</Message>
						</FormItem>
					)}
				</BalloonForm>
			</div>
		);
	};

	return (
		<Page>
			<HeaderLayout
				style={{ marginBottom: 8 }}
				left={
					<>
						<Button
							className="mr-8"
							type="primary"
							disabled={submitDisabled}
							onClick={handleSubmit}
						>
							提交修改
						</Button>
						<Button
							className="mr-8"
							type="primary"
							disabled={submitDisabled}
							onClick={handleCancel}
						>
							重新编辑
						</Button>
						<Button
							className="mr-8"
							onClick={() => setVisible(true)}
						>
							选择参数模板
						</Button>
						<Search
							onSearch={onSearch}
							style={{ width: '200px' }}
							placeholder="请输入搜索内容"
						/>
					</>
				}
				right={
					<Checkbox
						onChange={onChange}
						checked={checked}
						label="只显示已编辑参数"
					/>
				}
			/>
			<Table
				dataSource={checked ? checkedDataSource : dataSource}
				hasBorder={false}
				tableWidth={1270}
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
					title="参数默认值"
					dataIndex="defaultValue"
					width={210}
					cell={(value: string, index: number, record: ConfigItem) =>
						tooltipRender(value, index, record, 210)
					}
				/>
				<Table.Column
					title="修改目标值"
					dataIndex="modifiedValue"
					cell={valueRender}
					width={250}
				/>
				<Table.Column
					title="是否重启"
					dataIndex="restart"
					cell={isRestartRender}
					width={100}
				/>
				<Table.Column
					title="参数值范围"
					dataIndex="ranges"
					width={350}
					cell={(value: string, index: number, record: ConfigItem) =>
						tooltipRender(value, index, record, 350)
					}
				/>
				<Table.Column
					title="参数描述"
					dataIndex="description"
					cell={descriptionRender}
					// {...lock}
					width={200}
				/>
			</Table>
			{visible && (
				<ParamterTemplateForm
					visible={visible}
					onCreate={selectTemplate}
					onCancel={() => setVisible(false)}
					type={type}
					chartVersion={params.chartVersion}
				/>
			)}
		</Page>
	);
}
