import React, { useState, useEffect } from 'react';
import { Page } from '@alicloud/console-components-page';
import {
	Button,
	Table,
	Checkbox,
	Form,
	Icon,
	Input,
	Message,
	Dialog,
	Select
} from '@alicloud/console-components';
import HeaderLayout from '@/components/HeaderLayout';
import BalloonForm from '@/components/BalloonForm';
import ParamterTemplateForm from './paramterTemplateForm';
import messageConfig from '@/components/messageConfig';
import { getConfigs, updateConfig } from '@/services/middleware';

const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
	labelCol: { fixedSpan: 0 },
	wrapperCol: { span: 24 }
};
export default function ParamterLIst(props) {
	const { clusterId, namespace, middlewareName, type, onFreshChange } = props;
	const [dataSource, setDataSource] = useState([]);
	const [showDataSource, setShowDataSource] = useState();
	const [checked, setChecked] = useState(false);
	const [submitDisabled, setSubmitDisabled] = useState(true);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const list = dataSource.filter(
			(item) => item.value != item.modifiedValue
		);
		setShowDataSource(list);
	}, [dataSource]);

	useEffect(() => {
		getData(clusterId, namespace, middlewareName, type);
	}, [props]);

	const getData = (clusterId, namespace, middlewareName, type) => {
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
					res.data.map((item) => {
						item.modifiedValue = item.value;
						return item;
					});
				setDataSource(list);
			}
		});
	};

	const onChange = (checked) => {
		setChecked(checked);
	};

	const isRestartRender = (value, index, record) => {
		return record.restart ? '是' : '否';
	};

	const handleSubmit = () => {
		const list = dataSource.filter(
			(item) => item.value != item.modifiedValue
		);
		const sendList = list.map((item) => {
			item.value = item.modifiedValue;
			return item;
		});
		const restartFlag = sendList.some((item) => {
			if (item.restart === true) return true;
			return false;
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
		if (restartFlag) {
			Dialog.show({
				title: '修改参数',
				content:
					'本次修改需要重启实例才能生效，可能导致业务中断，请谨慎操作',
				onOk: () => {
					updateData(sendData);
				},
				onCancel: () => {}
			});
		} else {
			Dialog.show({
				title: '修改参数',
				content:
					'本次修改无需重启实例，参数将在提交后的15秒左右生效，请确认提交',
				onOk: () => {
					updateData(sendData);
				},
				onCancel: () => {}
			});
		}
	};

	const updateData = (data) => {
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
				} else {
					Message.show(messageConfig('error', '失败', res));
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
			},
			onCancel: () => {}
		});
	};

	const judgeSubmit = () => {
		const flag = dataSource.every((item) => {
			if (item.value == item.modifiedValue) return true;
			return false;
		});
		return flag;
	};

	const updateValue = (value, record) => {
		console.log(value, record);
		if (record.paramType === 'multiSelect') {
			record.modifiedValue = value[record.name].join(',');
		} else {
			record.modifiedValue = value[record.name];
		}
		setDataSource([...dataSource]);
		setSubmitDisabled(judgeSubmit());
	};

	const selectTemplate = (values) => {
		const list = dataSource.map((item) => {
			values.map((it) => {
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

	const valueRender = (value, index, record) => {
		const flag = record.value != record.modifiedValue;
		let selectList = [];
		let defaultSelects = [];
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
					trigger={<Icon type="edit" size="xs" />}
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
			<Page.Content style={{ padding: '0 0' }}>
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
							<Button onClick={() => setVisible(true)}>
								参数模板
							</Button>
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
					dataSource={checked ? showDataSource : dataSource}
					hasBorder={false}
				>
					<Table.Column
						title="参数名"
						dataIndex="name"
						width={280}
						lock
					/>
					<Table.Column
						title="参数默认值"
						dataIndex="defaultValue"
						width={250}
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
						width={80}
					/>
					<Table.Column
						title="参数值范围"
						dataIndex="ranges"
						width={500}
					/>
					<Table.Column
						title="参数描述"
						dataIndex="description"
						lock="right"
						width={200}
					/>
				</Table>
			</Page.Content>
			{visible && (
				<ParamterTemplateForm
					visible={visible}
					onCreate={selectTemplate}
					onCancel={() => setVisible(false)}
					type={type}
				/>
			)}
		</Page>
	);
}
