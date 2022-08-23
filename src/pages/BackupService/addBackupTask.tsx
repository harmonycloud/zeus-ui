import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import {
	Button,
	Divider,
	Steps,
	Form,
	TimePicker,
	InputNumber,
	Checkbox,
	Radio,
	Input,
	Select,
	Card,
	notification
} from 'antd';
import { api } from '@/api.json';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import TableRadio from '@/components/TableRadio';
import { list } from '@/utils/const';
import Backup from '@/assets/images/backup.svg';
import Database from '@/assets/images/database.svg';
import BackupRule from '@/assets/images/backupRule.svg';
import BackupPosition from '@/assets/images/backupPosition.svg';
import {
	getMiddlewares,
	getServiceList,
	getBackupAddress,
	addBackupConfig
} from '@/services/backup';
import moment from 'moment';
import { weekMap } from '@/utils/const';
import { StoreState } from '@/types';
import { connect } from 'react-redux';
import './index.scss';

const { Step } = Steps;
const { Group: CheckboxGroup } = Checkbox;
const { Group: RadioGroup } = Radio;
const steps = [
	{
		title: '选择数据源'
	},
	// {
	// 	title: '选择备份对象'
	// },
	{
		title: '选择备份规则'
	},
	{
		title: '创建备份任务'
	}
];
const formItemLayout = {
	labelCol: {
		span: 3
	},
	wrapperCol: {
		span: 16
	}
};

const columns = [
	{ title: '数据源名称', dataIndex: 'name' },
	{ title: '类型', dataIndex: 'type' },
	{ title: '实例数', dataIndex: 'podNum' },
	{ title: '所属命名空间', dataIndex: 'namespace' },
	{ title: '所属集群', dataIndex: 'clusterId' }
];
const dataType = [
	{ label: '天', value: 'day', max: 3650 },
	{ label: '周', value: 'week', max: 521 },
	{ label: '月', value: 'month', max: 120 },
	{ label: '年', value: 'year', max: 10 }
];
function AddBackupTask(props: StoreState): JSX.Element {
	const {
		globalVar: { cluster, namespace }
	} = props;
	const params: any = useParams();
	const [form] = Form.useForm();
	const [formWay] = Form.useForm();
	const history = useHistory();
	const [middlewares, serMiddleware] = useState<any[]>([]);
	const [select, setSelect] = useState('');
	const [isStep, setIsStep] = useState(false);
	const [current, setCurrent] = useState<number>(0);
	const [selectedRow, setSelectedRow] = useState<any>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>();
	const [searchText, setSearchText] = useState<string>('');
	const [selectText, setSelectText] = useState<string>('');
	// const [backupType, setBackupType] = useState<string>('service');
	const [backupWay, setBackupWay] = useState<string>('time');
	const [backupTime, setBackupTime] = useState<string>('time');
	const [checks, setChecks] = useState<number[]>();
	const [allChecked, setAllChecked] = useState<boolean>();
	const [dataSelect, setDataSelect] = useState<string>('day');
	const [formData, setFormData] = useState<any>();
	const [formWayData, setFormWayData] = useState<any>();
	const [tableData, setTableData] = useState<any>({ '': [] });
	const [addressList, setAddressList] = useState<any>();
	const [selectAddress, setSelectAddress] = useState<any>();
	const next = () => {
		if (current === 0) {
			if (selectedRow) {
				setCurrent(current + 1);
			} else {
				notification.error({
					message: '失败',
					description: '请选择备份源'
				});
			}
		}
		if (current === 1) {
			form.validateFields().then((values) => {
				setFormData(values);
				setCurrent(current + 1);
			});
		}
	};

	const prev = () => {
		if (current === 1) {
			form.validateFields().then((values) => {
				setFormData(values);
			});
		}
		if (current === 2) {
			setFormWayData(formWay.getFieldsValue());
		}
		setCurrent(current - 1);
	};

	useEffect(() => {
		if (params.type) {
			setSelectText(params.name);
			setCurrent(1);
			setIsStep(true);
		}
	}, []);

	useEffect(() => {
		if (params.type) {
			setSelectedRowKeys(params.middlewareName);
			setSelectText(params.name);
			setCurrent(1);
			setIsStep(true);
		} else {
			getMiddlewares().then((res) => {
				const data = res.data.filter(
					(item: any) =>
						item.name === 'Redis' ||
						item.name === 'RocketMQ' ||
						item.name === 'Elasticsearch' ||
						item.name === 'MySQL' ||
						item.name === 'PostgreSQL'
				);
				serMiddleware(data);
				setSelect(data[0].chartName);
				setSelectText(data[0].chartName);
			});
		}
		getBackupAddress({ keyword: '' }).then((res) => {
			setAddressList(res.data);
		});
	}, []);

	useEffect(() => {
		setTableData({ '': [] });
		if (selectText) {
			getServiceList({
				type: params.name || selectText,
				keyword: searchText
			}).then((res) => {
				console.log({ [params.name || selectText]: res.data });
				setTableData({ [params.name || selectText]: res.data });
				// setSelectedRowKeys([res.data[0]?.name]);
				// setSelectedRow(res.data[0]);
			});
		}
	}, [searchText, selectText]);

	useEffect(() => {
		if (current === 1) {
			form.setFieldsValue(formData);
		}
		if (current === 2) {
			formWay.setFieldsValue(formWayData);
		}
	}, [current]);

	const renderStep = () => {
		switch (current) {
			case 0:
				return (
					<div>
						<TableRadio
							showHeader
							label="数据库源名称"
							select={{
								value: selectText,
								onChange: (value: string) =>
									setSelectText(value),
								style: {
									marginRight: '16px',
									width: '120px'
								},
								options: middlewares?.map((item) => {
									return {
										label: item.name,
										value: item.chartName
									};
								})
							}}
							search={{
								placeholder: '请输入关键字搜索',
								onSearch: (value: string) =>
									setSearchText(value),
								style: {
									width: '200px'
								}
							}}
							showRefresh
							onRefresh={() => setSearchText('')}
							columns={columns}
							dataSource={tableData[params.name || selectText]}
							selectedRow={selectedRow}
							setSelectedRow={setSelectedRow}
							selectedRowKeys={selectedRowKeys}
							setSelectedRowKeys={setSelectedRowKeys}
						/>
					</div>
				);
			// case 1:
			// 	return (
			// 		<div className="service-object">
			// 			<div className="service-type">
			// 				<label>备份对象</label>
			// 				<div className="service-cards">
			// 					<Card
			// 						className={
			// 							backupType === 'service'
			// 								? 'active-card'
			// 								: ''
			// 						}
			// 						onClick={() => setBackupType('service')}
			// 					>
			// 						<img src={Backup} />
			// 						<p>服务</p>
			// 						<p>针对数据源进行服务备份</p>
			// 					</Card>
			// 					<Card
			// 						className={
			// 							backupType === 'pods'
			// 								? 'active-card'
			// 								: ''
			// 						}
			// 						onClick={() => setBackupType('pods')}
			// 					>
			// 						<img src={Backup} />
			// 						<p>实例</p>
			// 						<p>针对数据源进行单个实例备份</p>
			// 					</Card>
			// 				</div>
			// 			</div>
			// 			{backupType === 'pods' && (
			// 				<div>
			// 					<h2>实例列表</h2>
			// 					<TableRadio
			// 						showHeader
			// 						search={{
			// 							placeholder: '请输入关键字搜索',
			// 							onSearch: (value: string) =>
			// 								setSearchText(value),
			// 							style: {
			// 								width: '200px'
			// 							}
			// 						}}
			// 						showRefresh
			// 						onRefresh={() =>
			// 							setSearchText(`${Math.random()}`)
			// 						}
			// 						columns={columns}
			// 						dataSource={data}
			// 						selectedRow={selectedRow}
			// 						setSelectedRow={setSelectedRow}
			// 					/>
			// 				</div>
			// 			)}
			// 		</div>
			// 	);
			case 1:
				return (
					<div>
						<h2>备份规则</h2>
						<Form
							{...formItemLayout}
							form={form}
							style={{ marginTop: '24px' }}
							labelAlign="left"
						>
							<Form.Item
								label="备份方式"
								required
								name="way"
								rules={[
									{
										required: true,
										message: '请选择备份方式'
									}
								]}
								initialValue="time"
							>
								<RadioGroup
									value={backupWay}
									onChange={(e) =>
										setBackupWay(e.target.value)
									}
								>
									<Radio value="time">周期备份</Radio>
									<Radio value="one">单次备份</Radio>
								</RadioGroup>
							</Form.Item>
							{backupWay === 'time' ? (
								params.type === 'mysql' ||
								selectedRow?.type === 'mysql' ? (
									<Form.Item
										label="备份保留个数"
										name="limitRecord"
										rules={[
											{
												required: true,
												message: '备份保留个数不能为空'
											},
											{
												min: 1,
												type: 'number',
												message: '保留个数不能小于1'
											}
										]}
									>
										<InputNumber style={{ width: 160 }} />
									</Form.Item>
								) : (
									<Form.Item
										label="备份保留时间"
										name="retentionTime"
										rules={[
											{
												required: true,
												message: '备份保留时间不能为空'
											},
											{
												max: dataType.find(
													(item: any) =>
														item.value ===
														dataSelect
												)?.max,
												type: 'number',
												message: '保留时间最长为10年'
											},
											{
												min: 0,
												type: 'number',
												message: '保留时间不能小于0'
											}
										]}
									>
										<InputNumber
											type="inline"
											addonAfter={
												<Select
													value={dataSelect}
													onChange={(value) => {
														setDataSelect(value);
														form.validateFields([
															'dateUnit'
														]);
													}}
													dropdownMatchSelectWidth={
														false
													}
												>
													{dataType?.map(
														(item: any) => {
															return (
																<Select.Option
																	key={
																		item.value
																	}
																	value={
																		item.value
																	}
																>
																	{item.label}
																</Select.Option>
															);
														}
													)}
												</Select>
											}
										/>
									</Form.Item>
								)
							) : // <Form.Item
							// 	label="备份规则"
							// 	name="rule"
							// 	rules={[
							// 		{
							// 			required: true,
							// 			message: '请选择备时间'
							// 		}
							// 	]}
							// 	initialValue="now"
							// >
							// 	<RadioGroup
							// 		value={backupTime}
							// 		onChange={(e) =>
							// 			setBackupTime(e.target.value)
							// 		}
							// 	>
							// 		<Radio value="now">立即备份</Radio>
							// 		<Radio value="onetime">定时备份</Radio>
							// 	</RadioGroup>
							// </Form.Item>
							null}
							{backupWay === 'time' ||
							backupTime === 'onetime' ? (
								<>
									<Form.Item
										label="备份周期"
										className="check-form"
										required
									>
										<Form.Item>
											<Checkbox
												style={{ marginRight: '12px' }}
												onChange={(
													value: CheckboxChangeEvent
												) => {
													value.target.checked
														? setChecks([
																0, 1, 2, 3, 4,
																5, 6
														  ])
														: setChecks([]);
													value.target.checked
														? form.setFieldsValue({
																cycle: [
																	0, 1, 2, 3,
																	4, 5, 6
																]
														  })
														: form.setFieldsValue({
																cycle: []
														  });
													form.validateFields([
														'cycle'
													]);
													setAllChecked(
														value.target.checked
													);
												}}
												checked={allChecked}
											>
												全选
											</Checkbox>
										</Form.Item>
										<Form.Item
											name="cycle"
											rules={[
												{
													required: true,
													message:
														'备份周期不能为空！'
												}
											]}
										>
											<CheckboxGroup
												options={list}
												value={checks}
												onChange={(
													value: CheckboxValueType[]
												) => {
													setChecks(
														value as number[]
													);
													(value as number[])
														.sort(
															(
																a: number,
																b: number
															) => a - b
														)
														.join(',') ===
													'0,1,2,3,4,5,6'
														? setAllChecked(true)
														: setAllChecked(false);
												}}
											/>
										</Form.Item>
									</Form.Item>
									<Form.Item
										label="备份时间"
										name="time"
										rules={[
											{
												required: true,
												message: '备份时间不能为空'
											}
										]}
									>
										<TimePicker
											showNow={false}
											// minuteStep={30}
											format="HH:mm"
										/>
									</Form.Item>
								</>
							) : null}
						</Form>
					</div>
				);
			case 2:
				return (
					<div>
						<Form
							{...formItemLayout}
							form={formWay}
							labelAlign="left"
						>
							<Form.Item
								label="备份任务名称"
								name="taskName"
								rules={[
									{
										required: true,
										message: '请输入备份任务名称'
									},
									{
										max: 10,
										type: 'string',
										message: '备份任务名称不能超过10个字'
									}
								]}
							>
								<Input
									placeholder="XXX计划"
									style={{ width: 260 }}
								/>
							</Form.Item>
							<Form.Item label="备份方式" required>
								<div className="backup-way">
									<Card
										title={
											<div>
												<img src={Database} />
												<span>1.数据源</span>
											</div>
										}
									>
										<p>
											数据源类型：
											{params.type || selectedRow.type}
										</p>
										<p>
											数据源名称：
											{params.middlewareName ||
												selectedRow.name}
										</p>
										{!params.type ? (
											<Button
												type="primary"
												style={{ marginTop: '24px' }}
												onClick={() => {
													setCurrent(0);
													setFormWayData(
														formWay.getFieldsValue()
													);
												}}
											>
												修改
											</Button>
										) : null}
									</Card>
									<Card
										title={
											<div>
												<img src={BackupRule} />
												<span>2.备份规则</span>
											</div>
										}
									>
										<p>
											备份方式：
											{formData.way === 'time'
												? '周期备份'
												: '单次备份'}
										</p>
										<p
											style={{
												visibility:
													backupWay === 'one'
														? 'hidden'
														: 'visible'
											}}
										>
											备份时间：
											{formData.rule !== 'now'
												? '每周'
												: ''}
											{formData.rule !== 'now'
												? formData.cycle
														?.map(
															(item: string) =>
																weekMap[item]
														)
														.join('、')
												: '/'}
											{formData.rule !== 'now'
												? `（${
														moment(
															formData.time
														).get('hour') >= 10
															? moment(
																	formData.time
															  ).get('hour')
															: '0' +
															  moment(
																	formData.time
															  ).get('hour')
												  }:${
														moment(
															formData.time
														).get('minute') >= 10
															? moment(
																	formData.time
															  ).get('minute')
															: '0' +
															  moment(
																	formData.time
															  ).get('minute')
												  }）`
												: ''}
										</p>
										<Button
											type="primary"
											style={{ marginTop: '24px' }}
											onClick={() => {
												setCurrent(1);
												setFormWayData(
													formWay.getFieldsValue()
												);
											}}
										>
											修改
										</Button>
									</Card>
									<Card
										title={
											<div>
												<img src={BackupPosition} />
												<span>3.备份位置</span>
											</div>
										}
									>
										<span>备份位置：</span>
										<Form.Item
											name="addressId"
											rules={[
												{
													required: true,
													message: '请选择备份位置'
												}
											]}
										>
											<Select
												placeholder="请选择备份位置"
												value={selectAddress}
												onChange={(value) => {
													setSelectAddress(value);
												}}
												style={{ width: '150px' }}
												dropdownMatchSelectWidth={false}
											>
												{addressList?.map(
													(item: any) => {
														return (
															<Select.Option
																key={item.name}
																value={
																	item.addressId
																}
															>
																{item.name}
															</Select.Option>
														);
													}
												)}
											</Select>
										</Form.Item>
									</Card>
								</div>
							</Form.Item>
						</Form>
					</div>
				);
		}
	};

	const handleSubmit = () => {
		formWay.validateFields().then((values) => {
			const minute = moment(formData.time).get('minute');
			const hour = moment(formData.time).get('hour');
			const week = formData.cycle?.join(',');
			const cron = `${minute} ${hour} ? ? ${week}`;
			const sendData = {
				...values,
				clusterId: selectedRow?.clusterId || cluster.id,
				namespace: params.namespace || selectedRow.namespace,
				middlewareName: params.middlewareName || selectedRow.name,
				type: selectedRow?.type || params.type
			};
			if (params.type === 'mysql' || selectedRow?.type === 'mysql') {
				sendData.limitRecord = formData.limitRecord;
			} else {
				sendData.retentionTime = formData.retentionTime;
			}
			if (formData.retentionTime) {
				sendData.dateUnit = dataSelect;
			}
			if (formData.way === 'time') {
				sendData.cron = cron;
			}
			addBackupConfig(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '创建成功'
					});
					history.goBack();
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};

	return (
		<ProPage>
			<ProHeader
				title="新增备份任务"
				avatar={{
					children: <img src={Backup} />,
					shape: 'square',
					size: 48,
					style: { background: '#f5f5f5' }
				}}
				onBack={() => {
					if (params.type) {
						history.goBack();
					} else {
						!isStep ? history.goBack() : setIsStep(false);
					}
				}}
			/>
			<ProContent>
				<h2>数据源类型</h2>
				{!isStep ? (
					<div className="cards">
						{middlewares?.map((item) => {
							return (
								<div key={item.id} className="card-box">
									<div
										className={`card ${
											select === item.chartName
												? 'active'
												: ''
										}`}
										onClick={() => {
											setSelect(item.chartName);
											setSelectText(item.chartName);
										}}
									>
										<img
											src={`${api}/images/middleware/${item.imagePath}`}
										/>
									</div>
									<div className="card-title">
										{item.name}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<>
						<Steps current={current}>
							{steps?.map((item) => (
								<Step key={item.title} title={item.title} />
							))}
						</Steps>
						<div className="steps-content">{renderStep()}</div>
					</>
				)}
				<Divider
					style={{ marginTop: '40px', display: 'inline-block' }}
				></Divider>
				{!isStep ? (
					<div>
						<Button type="primary" onClick={() => setIsStep(true)}>
							开始备份
						</Button>
						<Button
							style={{ marginLeft: '8px' }}
							onClick={() => history.goBack()}
						>
							取消
						</Button>
					</div>
				) : (
					<div className="steps-action">
						{(current > 1 || (!params.type && current > 0)) && (
							<Button
								style={{ margin: '0 8px' }}
								onClick={() => prev()}
							>
								上一步
							</Button>
						)}
						{current < steps.length - 1 && (
							<Button type="primary" onClick={() => next()}>
								下一步
							</Button>
						)}
						{current === steps.length - 1 && (
							<Button type="primary" onClick={handleSubmit}>
								完成
							</Button>
						)}
						<Button
							style={{ marginLeft: '8px' }}
							onClick={() => {
								if (params.type) {
									history.goBack();
								} else {
									!isStep
										? history.goBack()
										: setIsStep(false);
								}
							}}
						>
							取消
						</Button>
					</div>
				)}
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(AddBackupTask);
