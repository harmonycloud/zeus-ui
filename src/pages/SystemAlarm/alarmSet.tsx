import React, { useEffect, useState } from 'react';
import {
	Form,
	Input,
	Button,
	Field,
	Grid,
	Message,
	Icon
} from '@alicloud/console-components';
import Ding from '@/assets/images/ding.svg';
import Email from '@/assets/images/email.svg';
import {
	getMailInfo,
	setDing,
	setMail,
	getDing,
	connectDing,
	connectMail
} from '@/services/alarm';
import messageConfig from '@/components/messageConfig';

const { Row, Col } = Grid;
const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};

function AlarmSet(props: any) {
	const field = Field.useField();
	const { activeKey } = props;

	const dingField = Field.useField();
	const [btnStatus, setBtnStatus] = useState<boolean>(true);
	const [dingBtnStatus, setDingBtnStatus] = useState<boolean>(true);
	const [data, setData] = useState();
	const [dingData, setDingData] = useState();
	const [dingFormList, setDingFormList] = useState([
		{ index: 0, id: Math.random() }
	]);
	const [connect, setConnect] = useState<string>('');
	const [dingConnect, setDingConnect] = useState<string[] | null>();
	const [show, setShow] = useState<boolean>(true);
	const [dingShow, setDingShow] = useState<boolean>(true);

	useEffect(() => {
		if (activeKey === 'alarmSet') {
			getDingData();
			getMailInfoData();
		}
	}, [activeKey]);

	const getDingData = () => {
		getDing().then((res) => {
			if (!res.data || !res.data.length) return;
			res.data.map((item: any, index: number) => {
				dingField.setValues({
					['webhook' + index]: item.webhook,
					['secretKey' + index]: item.secretKey
				});
			});
			setDingFormList(res.data);
			checkDingBtn();
			setDingData(res.data);
		});
	};

	const getMailInfoData = () => {
		getMailInfo().then(async (res) => {
			if (!res.data) return;
			await field.setValues(res.data);
			checkBtn();
			setData(res.data);
		});
	};

	const submit = () => {
		field.validate((error, value) => {
			if (error) return;
			setMail(value).then((res) => {
				if (res.data) return;
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '邮箱设置成功')
					);
					getMailInfoData();
				} else {
					Message.show(messageConfig('error', '失败', res.errorMsg));
				}
			});
		});
	};

	const dingSubmit = () => {
		dingField.validate((error, value) => {
			if (error) return;
			const arr1: any[] = [];
			const arr2: any[] = [];
			for (const x in value) {
				if (x.substring(0, x.length - 1) === 'webhook') {
					arr1.splice(
						Number(x.substring(x.length - 1, x.length)),
						0,
						{
							[x.substring(0, x.length - 1)]: value[x]
						}
					);
				} else {
					arr2.splice(
						Number(x.substring(x.length - 1, x.length)),
						0,
						{
							[x.substring(0, x.length - 1)]: value[x]
						}
					);
				}
			}
			const arrs = arr1.map((item, index) => {
				const data = arr2.find((i, key) => index == key);
				return {
					...item,
					...data
				};
			});
			setDing(arrs).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '钉钉机器人设置成功')
					);
					getDingData();
				} else {
					Message.show(messageConfig('error', '失败', res.errorMsg));
				}
			});
		});
	};

	const checkBtn = () => {
		const obj: any = {
			port: null,
			password: null,
			mailPath: null,
			mailServer: null,
			userName: null,
			...field.getValues()
		};
		const arr = [];
		for (const key in obj) {
			key !== 'time' && arr.push(obj[key]);
		}
		arr.every((item) => item) ? setBtnStatus(false) : setBtnStatus(true);
	};

	const checkDingBtn = () => {
		let obj = {};
		const arr = [];
		dingField.getNames().map((item) => {
			obj = {
				[item]: null,
				...dingField.getValues()
			};
		});
		for (const key in obj) {
			key.indexOf('secretKey') === -1 && arr.push(obj[key]);
		}
		arr.every((item) => item)
			? setDingBtnStatus(false)
			: setDingBtnStatus(true);
	};

	const addDingFormList = () => {
		if (dingFormList.length < 10) {
			setDingFormList([
				...dingFormList,
				{ index: dingFormList.length, id: Math.random() }
			]);
		} else {
			Message.show(
				messageConfig('warning', '提示', '最多只能添加10个Webhook')
			);
		}
	};

	const reduceDingFormList = (id: number, index: number) => {
		dingFormList.length > 1 &&
			setDingFormList(dingFormList.filter((arr) => id !== arr.id));
		dingConnect &&
			dingFormList.length > 1 &&
			setDingConnect(dingConnect.filter((arr, i) => i !== index));
	};

	const testMail = () => {
		const data: any = field.getValues();
		const sendData = {
			email: data.userName,
			password: data.password
		};
		connectMail(sendData).then((res) => {
			res.data ? setConnect('good') : setConnect('bad');
		});
	};

	const testDing = () => {
		dingField.validate((error, value) => {
			if (error) return;
			const arr1: any = [];
			const arr2: any = [];
			for (const x in value) {
				if (x.substring(0, x.length - 1) === 'webhook') {
					arr1.splice(x.substring(x.length - 1, x.length), 0, {
						[x.substring(0, x.length - 1)]: value[x]
					});
				} else {
					arr2.splice(x.substring(x.length - 1, x.length), 0, {
						[x.substring(0, x.length - 1)]: value[x]
					});
				}
			}
			const arrs = arr1.map((item: any, index: number) => {
				const data = arr2.find(
					(i: string, key: number) => index == key
				);
				return {
					...item,
					...data
				};
			});
			connectDing(arrs).then((res) => {
				if (res.success) {
					setDingConnect(res.data.map((item: any) => item.success));
				} else {
					Message.show(messageConfig('error', '失败', res.errorMsg));
				}
			});
		});
	};

	return (
		<div className="alarm-set">
			<div className="box">
				<div className="box-header" onClick={() => setShow(!show)}>
					<div className="header-img">
						<img src={Email} />
					</div>
					<div className="header-info">
						<div>
							<span className="type">邮箱</span>
							<span className={data ? 'status' : 'status none'}>
								{data ? '已设置' : '未设置'}
							</span>
						</div>
						<p>
							设置一个能正常收、发邮件到邮件服务器，告警信息第一时间通过邮件告知，及时、高效、规范。
						</p>
					</div>
					<div className="show-box">
						<span className="show-icon">
							<Icon
								type={
									show
										? 'angle-double-up'
										: 'angle-double-down'
								}
								size="xs"
								style={{ color: '#C0C6CC' }}
							/>
						</span>
					</div>
				</div>
				<div
					className="box-content"
					style={{ display: show ? 'block' : 'none' }}
				>
					<Row>
						<Col span={13} offset={4}>
							<Form
								field={field}
								{...formItemLayout}
								style={{ padding: '24px' }}
							>
								<Form.Item
									required
									requiredMessage="请输入邮箱服务器"
									label="邮箱服务器"
									style={{ position: 'relative' }}
								>
									<Input
										placeholder="请输入邮箱服务器"
										name="mailServer"
										onChange={checkBtn}
									/>
									{connect && (
										<div className="concat">
											<span
												className={
													connect === 'good'
														? 'good'
														: 'bad'
												}
											>
												{connect === 'good'
													? '可用'
													: '不可用'}
											</span>
										</div>
									)}
								</Form.Item>
								<Form.Item
									required
									requiredMessage="请输入端口"
									label="端口"
								>
									<Input
										placeholder="请输入端口"
										name="port"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									required
									requiredMessage="请输入邮箱"
									label="邮箱"
								>
									<Input
										placeholder="请输入邮箱"
										name="userName"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									required
									requiredMessage="请输入密码"
									label="密码"
								>
									<Input.Password
										placeholder="请输入密码"
										name="password"
										onChange={checkBtn}
									/>
								</Form.Item>
								<div className="btns">
									<Button
										onClick={() => {
											field.reset();
											checkBtn();
											setConnect('');
										}}
									>
										重置
									</Button>
									<Button
										className={
											btnStatus
												? 'test normal'
												: 'test error'
										}
										disabled={btnStatus}
										onClick={testMail}
										type="primary"
									>
										连接测试
									</Button>
									<Button
										className={
											btnStatus
												? 'save normal'
												: 'save error'
										}
										disabled={btnStatus}
										onClick={submit}
										type="primary"
									>
										保存
									</Button>
								</div>
							</Form>
						</Col>
					</Row>
				</div>
			</div>
			<div className="box">
				<div
					className="box-header"
					onClick={() => setDingShow(!dingShow)}
				>
					<div className="header-img">
						<img src={Ding} />
					</div>
					<div className="header-info">
						<div>
							<span className="type">钉钉</span>
							<span
								className={dingData ? 'status' : 'status none'}
							>
								{dingData ? '已设置' : '未设置'}
							</span>
						</div>
						<p>
							设置一个或多个钉钉机器人，告警信息第一时间同步钉钉应用（最多添加10个Webhook）。
						</p>
					</div>
					<div className="show-box">
						<span className="show-icon">
							<Icon
								type={
									dingShow
										? 'angle-double-up'
										: 'angle-double-down'
								}
								size="xs"
								style={{ color: '#C0C6CC' }}
							/>
						</span>
					</div>
				</div>
				<div
					className="box-content"
					style={{ display: dingShow ? 'block' : 'none' }}
				>
					<Row>
						<Col span={13} offset={4}>
							<Form field={dingField} style={{ padding: '24px' }}>
								{dingFormList &&
									dingFormList.map((item, index) => {
										return (
											<div key={item.id}>
												<Form.Item
													required
													requiredMessage="请输入Webhook地址"
													label={
														'Webhook地址' +
														(index + 1)
													}
													style={{
														position: 'relative'
													}}
													labelCol={{ span: 5 }}
													wrapperCol={{ span: 19 }}
												>
													<Input
														placeholder="请输入Webhook地址"
														name={'webhook' + index}
														onChange={checkDingBtn}
													/>
													<div className="form-btn">
														<Button
															onClick={
																addDingFormList
															}
														>
															<Icon
																type="add"
																style={{
																	color: '#fff',
																	transform:
																		'scale(0.8)'
																}}
															/>
														</Button>
														<Button
															onClick={() =>
																reduceDingFormList(
																	item.id,
																	index
																)
															}
															className={
																index === 0
																	? 'disabled'
																	: ''
															}
														>
															<Icon
																type="minus"
																style={{
																	color: '#fff',
																	transform:
																		'scale(0.8)'
																}}
															/>
														</Button>
													</div>
													{dingConnect &&
														typeof dingConnect[
															index
														] !== 'undefined' && (
															<div className="concat">
																<span
																	className={
																		dingConnect[
																			index
																		]
																			? 'good'
																			: 'bad'
																	}
																>
																	{dingConnect[
																		index
																	]
																		? '可用'
																		: '不可用'}
																</span>
															</div>
														)}
												</Form.Item>
												<Form.Item
													label="加签密钥"
													labelCol={{
														span: 3,
														offset: 11
													}}
													wrapperCol={{ span: 10 }}
												>
													<Input
														placeholder="请输入加签密钥"
														name={
															'secretKey' + index
														}
														onChange={checkDingBtn}
													/>
												</Form.Item>
											</div>
										);
									})}
								<div className="btns">
									<Button
										onClick={() => {
											dingField.reset();
											setDingBtnStatus(true);
											setDingConnect(null);
										}}
									>
										重置
									</Button>
									<Button
										className={
											dingBtnStatus
												? 'test normal'
												: 'test error'
										}
										disabled={dingBtnStatus}
										onClick={testDing}
										type="primary"
									>
										连接测试
									</Button>
									<Button
										className={
											dingBtnStatus
												? 'save normal'
												: 'save error'
										}
										disabled={dingBtnStatus}
										onClick={dingSubmit}
										type="primary"
									>
										保存
									</Button>
								</div>
							</Form>
						</Col>
					</Row>
				</div>
			</div>
		</div>
	);
}

export default AlarmSet;
