import React, { useEffect, useState } from 'react';
import { Input, Button, Row, Col, Form, notification } from 'antd';
import {
	PlusOutlined,
	MinusOutlined,
	DoubleRightOutlined
} from '@ant-design/icons';

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

const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};

function AlarmSet(props: any): JSX.Element {
	const [form] = Form.useForm();
	const { activeKey } = props;

	const [dingForm] = Form.useForm();
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
				dingForm.setFieldsValue({
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
			await form.setFieldsValue(res.data);
			checkBtn();
			setData(res.data);
		});
	};

	const submit = () => {
		form.validateFields().then((value) => {
			setMail(value).then((res) => {
				if (res.data) return;
				if (res.success) {
					notification.success({
						message: '成功',
						description: '邮箱设置成功'
					});
					getMailInfoData();
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};

	const dingSubmit = () => {
		dingForm.validateFields().then((value) => {
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
					notification.success({
						message: '成功',
						description: '钉钉机器人设置成功'
					});
					getDingData();
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};

	const checkBtn = () => {
		const obj: any = {
			port: null,
			password: null,
			mailServer: null,
			userName: null,
			...form.getFieldsValue()
		};
		const arr = [];

		for (const key in obj) {
			key !== 'time' && key !== 'mailPath' && arr.push(obj[key]);
		}
		arr.every((item) => item) ? setBtnStatus(false) : setBtnStatus(true);
	};

	const checkDingBtn = () => {
		let obj = {};
		const arr = [];
		for (const i in dingForm.getFieldsValue()) {
			obj = {
				[i]: null,
				...dingForm.getFieldsValue()
			};
		}

		console.log(obj);

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
			setDingBtnStatus(true);
		} else {
			notification.warning({
				message: '提示',
				description: '最多只能添加10个Webhook'
			});
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
		const data: any = form.getFieldsValue();
		const sendData = {
			email: data.userName,
			password: data.password
		};
		connectMail(sendData).then((res) => {
			res.data ? setConnect('good') : setConnect('bad');
		});
	};

	const testDing = () => {
		dingForm.validateFields().then((value) => {
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
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
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
							<DoubleRightOutlined
								style={{
									color: '#C0C6CC',
									transform: show
										? 'rotate(-90deg)'
										: 'rotate(90deg)'
								}}
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
								form={form}
								{...formItemLayout}
								style={{ padding: '24px' }}
							>
								<Form.Item
									rules={[
										{
											required: true,
											message: '请输入邮箱服务器'
										}
									]}
									label="邮箱服务器"
									name="mailServer"
								>
									<Input
										placeholder="请输入邮箱服务器"
										onChange={checkBtn}
									/>
								</Form.Item>
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
								<Form.Item
									rules={[
										{
											required: true,
											message: '请输入端口'
										}
									]}
									label="端口"
									name="port"
								>
									<Input
										placeholder="请输入端口"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									rules={[
										{
											required: true,
											message: '请输入邮箱'
										}
									]}
									label="邮箱"
									name="userName"
								>
									<Input
										placeholder="请输入邮箱"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item
									rules={[
										{
											required: true,
											message: '请输入密码'
										}
									]}
									label="密码"
									name="password"
								>
									<Input.Password
										placeholder="请输入密码"
										onChange={checkBtn}
									/>
								</Form.Item>
								<div className="btns">
									<Button
										onClick={() => {
											form.resetFields();
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
							<DoubleRightOutlined
								style={{
									color: '#C0C6CC',
									transform: dingShow
										? 'rotate(-90deg)'
										: 'rotate(90deg)'
								}}
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
							<Form form={dingForm} style={{ padding: '24px' }}>
								{dingFormList &&
									dingFormList.map((item, index) => {
										return (
											<div key={item.id}>
												<div
													style={{
														position: 'relative'
													}}
												>
													<Form.Item
														rules={[
															{
																required: true,
																message:
																	'请输入Webhook地址'
															}
														]}
														label={
															'Webhook地址' +
															(index + 1)
														}
														labelCol={{ span: 5 }}
														wrapperCol={{
															span: 19
														}}
														name={'webhook' + index}
													>
														<Input
															placeholder="请输入Webhook地址"
															onChange={
																checkDingBtn
															}
														/>
													</Form.Item>
													<div className="form-btn">
														<Button
															onClick={
																addDingFormList
															}
															icon={
																<PlusOutlined
																	style={{
																		color: '#fff',
																		fontSize:
																			'9px'
																	}}
																/>
															}
														></Button>
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
															icon={
																<MinusOutlined
																	style={{
																		color: '#fff',
																		fontSize:
																			'9px'
																	}}
																/>
															}
														></Button>
													</div>
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
												<Form.Item
													label="加签密钥"
													labelCol={{
														span: 3,
														offset: 11
													}}
													wrapperCol={{ span: 10 }}
													name={'secretKey' + index}
												>
													<Input
														placeholder="请输入加签密钥"
														onChange={checkDingBtn}
													/>
												</Form.Item>
											</div>
										);
									})}
								<div className="btns">
									<Button
										onClick={() => {
											dingForm.resetFields();
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
