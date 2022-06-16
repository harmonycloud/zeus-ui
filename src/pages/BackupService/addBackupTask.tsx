import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
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
	Card
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import TableRadio from '@/components/TableRadio';
import { list } from '@/utils/const';
import Backup from '@/assets/images/backup.svg';
import Database from '@/assets/images/database.svg';
import BackupRule from '@/assets/images/backupRule.svg';
import BackupPosition from '@/assets/images/backupPosition.svg';

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
	{ title: '规格', dataIndex: 'spec' },
	{ title: 'CPU', dataIndex: 'cpu' },
	{ title: '内存', dataIndex: 'memory' }
];
const dataType = [
	{ label: '天', value: 'day', max: 3650 },
	{ label: '周', value: 'week', max: 521 },
	{ label: '月', value: 'month', max: 120 },
	{ label: '年', value: 'year', max: 10 }
];
function AddBackup(): JSX.Element {
	const [form] = Form.useForm();
	const [formWay] = Form.useForm();
	const history = useHistory();
	const [select, setSelect] = useState('Mysql');
	const [isStep, setIsStep] = useState(false);
	const [current, setCurrent] = useState<number>(0);
	const [selectedRow, setSelectedRow] = useState();
	const [searchText, setSearchText] = useState<string>('');
	const [selectText, setSelectText] = useState<string>('1');
	const [backupType, setBackupType] = useState<string>('service');
	const [backupWay, setBackupWay] = useState<string>('time');
	const [backupTime, setBackupTime] = useState<string>('time');
	const [checks, setChecks] = useState<number[]>();
	const [allChecked, setAllChecked] = useState<boolean>();
	const [dataSelect, setDataSelect] = useState<string>('天');

	const [data, setData] = useState([
		{
			id: '1',
			spec: '基本性能',
			cpu: '1 Core',
			memory: '2 Gi',
			num: '600'
		},
		{
			id: '2',
			spec: '一般性能',
			cpu: '2 Core',
			memory: '8 Gi',
			num: '2000'
		},
		{
			id: '3',
			spec: '较强性能',
			cpu: '4 Core',
			memory: '16 Gi',
			num: '4000'
		},
		{
			id: '4',
			spec: '高强性能',
			cpu: '8 Core',
			memory: '32 Gi',
			num: '8000'
		},
		{
			id: '5',
			spec: '超强性能',
			cpu: '16 Core',
			memory: '64 Gi',
			num: '16000'
		}
	]);

	const next = () => {
		setCurrent(current + 1);
	};

	const prev = () => {
		setCurrent(current - 1);
	};

	useEffect(() => {
		setData([
			{
				id: '1',
				spec: '基本性能',
				cpu: '1 Core',
				memory: '2 Gi',
				num: '600'
			},
			{
				id: '2',
				spec: '一般性能',
				cpu: '2 Core',
				memory: '8 Gi',
				num: '2000'
			},
			{
				id: '3',
				spec: '较强性能',
				cpu: `${Math.random()}`,
				memory: '16 Gi',
				num: `${Math.random()}`
			}
		]);
	}, [searchText, selectText]);

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
									width: '100px'
								},
								options: [
									{
										label: '1',
										value: '1'
									},
									{
										label: '2',
										value: '2'
									}
								]
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
							onRefresh={() => setSearchText(`${Math.random()}`)}
							columns={columns}
							dataSource={data}
							selectedRow={selectedRow}
							setSelectedRow={setSelectedRow}
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
								<>
									<Form.Item
										label="备份保留时间"
										name="count"
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
															'count'
														]);
													}}
												>
													{dataType.map(
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
										name="time2"
										rules={[
											{
												required: true,
												message: '备份时间不能为空'
											}
										]}
									>
										<TimePicker
											showNow={false}
											minuteStep={30}
											format="HH:mm"
										/>
									</Form.Item>
								</>
							) : (
								<Form.Item
									label="备份时间"
									name="time"
									rules={[
										{
											required: true,
											message: '请选择备时间'
										}
									]}
									initialValue="time"
								>
									<RadioGroup
										value={backupTime}
										onChange={(e) =>
											setBackupTime(e.target.value)
										}
									>
										<Radio value="time">立即备份</Radio>
										<Radio value="one">周期备份</Radio>
									</RadioGroup>
								</Form.Item>
							)}
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
								name="aa"
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
							<Form.Item
								label="备份方式"
								name="bb"
								rules={[
									{
										required: true,
										message: '请选择备份位置'
									}
								]}
							>
								<div className="backup-way">
									<Card
										title={
											<div>
												<img src={Database} />
												<span>1.数据源</span>
											</div>
										}
									>
										<p>数据源类型：MySQL</p>
										<p>
											数据源名称：Mysqltest-test-asdas-sdadasdfa
										</p>
										<Button
											type="primary"
											style={{ marginTop: '24px' }}
											onClick={() => setCurrent(0)}
										>
											修改
										</Button>
									</Card>
									<Card
										title={
											<div>
												<img src={BackupRule} />
												<span>2.备份规则</span>
											</div>
										}
									>
										<p>备份方式：MySQL</p>
										<p>
											备份时间：每周一、二、三、四、五、六、日（14:00）
										</p>
										<Button
											type="primary"
											style={{ marginTop: '24px' }}
											onClick={() => setCurrent(1)}
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
										<Select
											value={dataSelect}
											onChange={(value) => {
												setDataSelect(value);
												form.validateFields(['count']);
											}}
											style={{ width: '150px' }}
										>
											{dataType.map((item: any) => {
												return (
													<Select.Option
														key={item.value}
														value={item.value}
													>
														{item.label}
													</Select.Option>
												);
											})}
										</Select>
									</Card>
								</div>
							</Form.Item>
						</Form>
					</div>
				);
		}
	};

	const handleSubmit = () => {
		history.goBack();
	};

	return (
		<ProPage>
			<ProHeader
				title="新增备份任务"
				avatar={{
					children: <img src={Backup} />,
					shape: 'square',
					size: 24,
					style: { background: '#f5f5f5' }
				}}
				onBack={() => history.goBack()}
			/>
			<ProContent>
				{!isStep ? (
					<div className="cards">
						{['Mysql', 'Rocketmq'].map((item) => {
							return (
								<div key={item} className="card-box">
									<div
										className={`card ${
											select === item ? 'active' : ''
										}`}
										onClick={() => setSelect(item)}
									>
										<img src={Backup} />
									</div>
									<div className="card-title">{item}</div>
								</div>
							);
						})}
					</div>
				) : (
					<>
						<Steps current={current}>
							{steps.map((item) => (
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
						<Button style={{ marginLeft: '8px' }}>取消</Button>
					</div>
				) : (
					<div className="steps-action">
						{current > 0 && (
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
						<Button style={{ marginLeft: '8px' }}>取消</Button>
					</div>
				)}
			</ProContent>
		</ProPage>
	);
}

export default AddBackup;
