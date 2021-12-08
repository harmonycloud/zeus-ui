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
import { getMailInfo, setDing, setMail, getDing, connectDing, connectMail } from '@/services/alrem';
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

function AlarmSet() {
	const field = Field.useField();
	const dingField = Field.useField();
	const [btnStatus, setBtnStatus] = useState(true);
	const [dingBtnStatus, setDingBtnStatus] = useState(true);
	const [data, setData] = useState();
	const [dingData, setDingData] = useState();
	const [dingFormList, setDingFormList] = useState([{ index: 0, id: Math.random() }]);
	const [connect, setConnect] = useState();
	const [dingConnect, setDingConnect] = useState();
	const [show, setShow] = useState(true);
	const [dingShow, setDingShow] = useState(true);

	useEffect(() => {
		getMailInfo().then(async (res) => {
			if (!res.data) return;
			// console.log(res);
			await field.setValues(res.data);
			checkBtn();
			setData(res.data);
		});
		getDing().then(res => {
			if (!res.data || !res.data.length) return;
			// console.log(res);
			dingField.setValues(Object.assign(...res.data.map((item, index) => {
				return {
					['webhook' + index]: item.webhook,
					['secretKey' + index]: item.secretKey
				}
			})));
			setDingFormList(res.data);
			checkDingBtn();
			setDingData(res.data);
		})
	}, []);

	const submit = () => {
		field.validate((error, value) => {
			if (error) return;
			setMail(value).then((res) => {
				// console.log(res);
				if (res.data) return;
				getMailInfo();
				Message.show(messageConfig('success', '成功', '邮箱设置成功'));
			});
		});
	};

	const dingSubmit = () => {
		dingField.validate((error, value) => {
			if (error) return;
			let arr1 = [];
			let arr2 = [];
			for (let x in value) {
				if (x.substring(0, x.length - 1) === 'webhook') {
					arr1.splice(x.substring(x.length - 1, x.length), 0, { [x.substring(0, x.length - 1)]: value[x] });
				} else {
					arr2.splice(x.substring(x.length - 1, x.length), 0, { [x.substring(0, x.length - 1)]: value[x] });
				}
			}
			const arrs = arr1.map((item, index) => {
				const data = arr2.find((i, key) => index == key)
				return {
					...item,
					...data,
				}
			})
			console.log(arrs);
			setDing(arrs).then((res) => {
				// console.log(res);
				if (res.data) return;
				getDing();
				Message.show(
					messageConfig('success', '成功', '钉钉机器人设置成功')
				);
			});
		});
	};

	const checkBtn = () => {
		let obj = {
			port: null,
			password: null,
			mailPath: null,
			mailServer: null,
			userName: null,
			...field.getValues()
		};
		let arr = [];
		for (let key in obj) {
			key !== 'time' && arr.push(obj[key]);
		}
		arr.every((item) => item) ? setBtnStatus(false) : setBtnStatus(true);
	};

	const checkDingBtn = () => {
		let obj = {};
		let arr = [];
		dingField.getNames().map(item => {
			obj = {
				[item]: null,
				...dingField.getValues()
			}
		})
		for (let key in obj) {
			key.indexOf('secretKey') === -1 && arr.push(obj[key]);
		}
		arr.every((item) => item) ? setDingBtnStatus(false) : setDingBtnStatus(true);
	};

	const addDingFormList = () => {
		if (dingFormList.length < 10) {
			setDingFormList([...dingFormList, { index: dingFormList.length, id: Math.random() }]);
		} else {
			Message.show(
				messageConfig('warning', '提示', '最多只能添加10个Webhook')
			);
		}
	}

	const reduceDingFormList = (id, index) => {
		dingFormList.length > 1 && setDingFormList(dingFormList.filter(arr => id !== arr.id));
		dingConnect && dingFormList.length > 1 && setDingConnect(dingConnect.filter((arr,i) => i !== index));
	}

	const testMail = () => {
		let sendData = { email: field.getValues().userName };
		connectMail(sendData).then(res => {
			if (res.success) {
				Message.show(
					messageConfig('success', '成功', '测试完成')
				);
			}
			res.success ? setConnect('good') : setConnect('bad');
		})
	}

	const testDing = () => {
		dingField.validate((error, value) => {
			if (error) return;
			let arr1 = [];
			let arr2 = [];
			for (let x in value) {
				if (x.substring(0, x.length - 1) === 'webhook') {
					arr1.splice(x.substring(x.length - 1, x.length), 0, { [x.substring(0, x.length - 1)]: value[x] });
				} else {
					arr2.splice(x.substring(x.length - 1, x.length), 0, { [x.substring(0, x.length - 1)]: value[x] });
				}
			}
			const arrs = arr1.map((item, index) => {
				const data = arr2.find((i, key) => index == key)
				return {
					...item,
					...data,
				}
			})
			connectDing(arrs).then(res => {
				console.log(res);
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '测试完成')
					);
				}
				setDingConnect(res.data.map(item => item.success))
			})
		});
	}

	return (
		<div className="alarm-set">
			<div className="box">
				<div className="box-header">
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
						<span className="show-icon" onClick={() => setShow(!show)}>
							<Icon type="angle-double-down" size="xs" style={{ color: '#C0C6CC' }} />
						</span>
					</div>
				</div>
				<div className="box-content" style={{ display: show ? 'block' : 'none' }}>
					<Row>
						<Col span={13} offset={4}>
							<Form
								field={field}
								{...formItemLayout}
								style={{ padding: '24px' }}
							>
								<Form.Item required label="邮箱服务器" style={{ position: 'relative' }}>
									<Input
										placeholder="请输入邮箱服务器"
										name="mailServer"
										onChange={checkBtn}
									/>
									{
										connect && <div className="concat">
											<span className={connect === 'good' ? 'good' : 'bad'}>{connect === 'good' ? '可用' : '不可用'}</span>
										</div>
									}
								</Form.Item>
								<Form.Item required label="端口">
									<Input
										placeholder="请输入端口"
										name="port"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="用户">
									<Input
										placeholder="请输入用户"
										name="userName"
										onChange={checkBtn}
										onBlur={(e) =>
											field.setValues({
												mailPath: e.target.value
											})
										}
									/>
								</Form.Item>
								<Form.Item required label="密码">
									<Input
										placeholder="请输入密码"
										name="password"
										onChange={checkBtn}
									/>
								</Form.Item>
								<Form.Item required label="告警邮箱地址">
									<Input
										placeholder="所有的告警信息将由该地址发送到您的邮箱"
										name="mailPath"
										onChange={checkBtn}
									/>
								</Form.Item>
								<div className="btns">
									<Button
										onClick={() => {
											field.reset();
											checkBtn();
											setConnect();
										}}
									>
										取消
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
				<div className="box-header">
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
						<span className="show-icon" onClick={() => setDingShow(!dingShow)}>
							<Icon type="angle-double-down" size="xs" style={{ color: '#C0C6CC' }} />
						</span>
					</div>
				</div>
				<div className="box-content" style={{ display: dingShow ? 'block' : 'none' }}>
					<Row>
						<Col span={13} offset={4}>
							<Form
								field={dingField}
								style={{ padding: '24px' }}
							>
								{
									dingFormList && dingFormList.map((item, index) => {
										return (
											<div key={item.id}>
												<Form.Item
													required
													requiredMessage={"Webhook地址" + (index + 1) + "是必填字段"}
													label={"Webhook地址" + (index + 1)}
													style={{ position: "relative" }}
													labelCol={{ span: 5 }}
													wrapperCol={{ span: 19 }}
												>
													<Input
														placeholder="请输入Webhook地址"
														name={"webhook" + index}
														onChange={checkDingBtn}
													/>
													<div className="form-btn">
														<Button onClick={addDingFormList}>+</Button>
														<Button onClick={() => reduceDingFormList(item.id, index)} className={index === 0 ? "disabled" : ''}>-</Button>
													</div>
													{
														dingConnect && typeof dingConnect[index] !== 'undefined' && <div className="concat">
															<span className={dingConnect[index] ? 'good' : 'bad'}>{dingConnect[index] ? '可用' : '不可用'}</span>
														</div>
													}
												</Form.Item>
												<Form.Item
													label="加签密钥"
													labelCol={{ span: 3, offset: 11 }}
													wrapperCol={{ span: 10 }}
												>
													<Input
														placeholder="请输入加签密钥"
														name={"secretKey" + index}
														onChange={checkDingBtn}
													/>
												</Form.Item>
											</div>
										)
									})
								}
								<div className="btns">
									<Button
										onClick={() => {
											dingField.reset();
											setDingBtnStatus(true);
											setDingConnect();
										}}
									>
										取消
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
