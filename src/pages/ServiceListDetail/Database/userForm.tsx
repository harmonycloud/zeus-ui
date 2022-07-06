import React, { useEffect, useState } from 'react';
import {
	Modal,
	Form,
	Input,
	Checkbox,
	Radio,
	Popover,
	message,
	notification
} from 'antd';
import {
	QuestionCircleOutlined,
	CheckCircleFilled,
	CloseCircleFilled,
	SearchOutlined,
	SwapOutlined,
	DeleteOutlined
} from '@ant-design/icons';
import { createUser, grantUser, listDb } from '@/services/middleware';
import pattern from '@/utils/pattern';
import { FormProps } from './database';

import styles from '@/layouts/Navbar/User/./user.module.scss';

const FormItem = Form.Item;
const Password = Input.Password;
const TextArea = Input.TextArea;
const RadioGroup = Radio.Group;
const formItemLayout = {
	labelCol: {
		span: 3
	},
	wrapperCol: {
		span: 21
	}
};
export default function UserForm(props: FormProps): JSX.Element {
	const {
		visible,
		onCreate,
		onCancel,
		data,
		clusterId,
		namespace,
		middlewareName
	} = props;
	const [form] = Form.useForm();
	const [users, setUsers] = useState<any[]>([]);
	const [leftUsers, setLeftUsers] = useState<any[]>([]);
	const [rightUsers, setRightUsers] = useState<any[]>([]);
	const [selectUser, setSelectUser] = useState<any[]>([]);
	const [leftSearch, setLeftSearch] = useState<string>('');
	const [rightSearch, setRightSearch] = useState<string>('');
	const [checks, setChecks] = useState<boolean[]>([false, false]);
	const [error, setError] = useState<boolean>(false);

	useEffect(() => {
		if (data) {
			console.log(data);

			form.setFieldsValue({
				user: data.user,
				password: data.password,
				confirmPassword: data.password,
				description: data.description
			});
		}
		getUserList();
	}, [data]);
	const onOk: () => void = () => {
		form.validateFields().then((values) => {
			if (checks.includes(false) && !data) {
				message.warning('密码格式不正确');
				return;
			}
			if (error) {
				notification.error({
					message: '失败',
					description: '二次密码不一致'
				});
				return;
			}
			if (!selectUser.length) {
				notification.error({
					message: '失败',
					description: '请选择授权数据库'
				});
				return;
			}

			if (data) {
				const sendData = {
					clusterId,
					namespace,
					middlewareName,
					id: data.id,
					user: values.user,
					description: values.description,
					privilegeList: selectUser
				};
				// * 修改用户
				grantUser(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '用户修改成功'
						});
						onCreate();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				// * 创建用户
				const sendData = {
					clusterId,
					namespace,
					middlewareName,
					user: values.user,
					password: values.password,
					confirmPassword: values.confirmPassword,
					description: values.description,
					privilegeList: selectUser
				};
				createUser(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '用户创建成功'
						});
						onCreate();
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

	const getUserList = () => {
		listDb({ clusterId, namespace, middlewareName }).then((res) => {
			if (res.success) {
				if (data) {
					const result = res.data.map((item: any) => {
						return {
							id: item.id,
							authority: '2',
							db: item.db,
							charset: item.charset
						};
					});
					const selectUsers = data.dbs.map((item: any) => {
						return {
							id: item.id,
							authority: item.authority ? item.authority : '2',
							db: item.db,
							charset: item.charset
						};
					});
					const user = result.map((item: any) => {
						selectUsers.map((i: any) => {
							if (item.db === i.db) {
								item = { ...item, disabled: true };
							}
						});
						return item;
					});
					setUsers(user.filter((item: any) => !item.disabled));
					setLeftUsers(user.filter((item: any) => !item.disabled));
					setSelectUser(selectUsers);
					setRightUsers(selectUsers);
				} else {
					res.data &&
						setUsers(
							res.data.map((item: any) => {
								return {
									id: item.id,
									authority: '2',
									db: item.db,
									charset: item.charset
								};
							})
						);
					res.data &&
						setLeftUsers(
							res.data.map((item: any) => {
								return {
									id: item.id,
									authority: '2',
									db: item.db,
									charset: item.charset
								};
							})
						);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const defaultTrigger = (
		<FormItem
			labelAlign="left"
			name="password"
			labelCol={{ span: 7 }}
			className={data ? 'ne-required-ingress' : ''}
			label="数据库密码"
			rules={[
				{
					required: !data,
					message: '请输入数据库密码'
				}
			]}
			style={{ width: 415 }}
		>
			<Password
				onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
					handleChange(e.target.value, 'new')
				}
				disabled={data ? true : false}
				placeholder="请输入内容"
				style={{ width: 300 }}
			/>
		</FormItem>
	);

	const handleChange = (value: string, type: string) => {
		if (type === 'new') {
			const temp = [...checks];
			if (value.length >= 8 && value.length <= 32) {
				temp[0] = true;
			} else {
				temp[0] = false;
			}
			if (
				/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{3,}$/.test(
					value
				)
			) {
				temp[1] = true;
			} else {
				temp[1] = false;
			}
			setChecks(temp);
		} else {
			const newValue = form.getFieldValue('password');
			if (value !== newValue) {
				setError(true);
			} else {
				setError(false);
			}
		}
	};
	return (
		<Modal
			title={!data ? '新增用户' : '编辑用户'}
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			className="mysql-modal"
			width={1030}
		>
			<Form form={form} {...formItemLayout} style={{ paddingLeft: 12 }}>
				<FormItem
					labelAlign="left"
					className={data ? 'ne-required-ingress' : ''}
					name="user"
					label={
						<div>
							<span style={{ marginRight: 4 }}>数据库账号</span>
							<Popover
								content={
									'名称在1-32个字符之间，由字母、数字、中划线或下划线组成，不能包含其他特殊字符'
								}
							>
								<QuestionCircleOutlined
									style={{ cursor: 'pointer' }}
								/>
							</Popover>
						</div>
					}
					rules={[
						{
							required: !data,
							message: '请输入数据库账号'
						},
						{
							pattern: new RegExp(pattern.databaseUser),
							message:
								'32个字符之间，由字母、数字、中划线或下划线组成，不能包含其他特殊字符'
						}
					]}
				>
					<Input
						// trim={true}
						disabled={data ? true : false}
						placeholder="请输入内容"
						style={{ width: 300 }}
					/>
				</FormItem>
				<Popover
					content={
						<ul>
							<li className={styles['edit-form-icon-style']}>
								{checks[0] ? (
									<CheckCircleFilled
										style={{
											color: '#68B642',
											marginRight: 4
										}}
									/>
								) : (
									<CloseCircleFilled
										style={{
											color: '#Ef595C',
											marginRight: 4
										}}
									/>
								)}
								<span>(长度需要8-32之间)</span>
							</li>
							<li className={styles['edit-form-icon-style']}>
								{checks[1] ? (
									<CheckCircleFilled
										style={{
											color: '#68B642',
											marginRight: 4
										}}
									/>
								) : (
									<CloseCircleFilled
										style={{
											color: '#Ef595C',
											marginRight: 4
										}}
									/>
								)}
								<span>
									至少包含以下字符中的三种：大写字母、小写字母、数字和特殊字符～!@%^*-_=+?,()&
								</span>
							</li>
						</ul>
					}
					placement="right"
				>
					{defaultTrigger}
				</Popover>
				<FormItem
					labelAlign="left"
					label="密码二次输入"
					name="confirmPassword"
					className={data ? 'ne-required-ingress' : ''}
					rules={[
						{
							required: !data,
							message: '请输入二次确认密码'
						}
					]}
				>
					<Password
						// trim={true}
						disabled={data ? true : false}
						placeholder="请输入内容"
						style={{ width: 300 }}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							handleChange(e.target.value, 'newPassword')
						}
					/>
				</FormItem>
				<FormItem labelAlign="left" name="description" label="备注">
					<TextArea
						// trim={true}
						placeholder="限定200字符串"
						maxLength={200}
						style={{ width: 300 }}
					/>
				</FormItem>
				<FormItem labelAlign="left" label="数据库授权" required>
					<div className="transfer">
						<div className="transfer-box">
							<div className="transfer-title">未授权数据库</div>
							<div style={{ overflowX: 'auto' }}>
								<div className="transfer-header">
									<Input
										style={{ width: '100%' }}
										addonBefore={<SearchOutlined />}
										placeholder="请输入数据库名称检索"
										value={leftSearch}
										onChange={(e) => {
											setLeftSearch(e.target.value);
											e.target.value
												? setUsers(
														leftUsers.filter(
															(item: any) =>
																item.db.indexOf(
																	e.target
																		.value
																) !== -1
														)
												  )
												: setUsers(leftUsers);
										}}
									/>
									<div>
										<p>
											<span
												style={{
													width: '120px',
													textAlign: 'center'
												}}
											>
												数据库名称
											</span>
											<span
												style={{
													width: 50,
													textAlign: 'center'
												}}
											>
												字符集
											</span>
										</p>
									</div>
								</div>
								<ul className="transfer-content">
									{users.map((item, index) => {
										return (
											<li
												key={item.db}
												onClick={() => {
													setUsers(
														users.filter(
															(i) =>
																i.db !== item.db
														)
													);
													setLeftUsers(
														leftUsers.filter(
															(i) =>
																i.db !== item.db
														)
													);
													setSelectUser([
														...selectUser,
														users.find(
															(i) =>
																i.db === item.db
														)
													]);
													setRightUsers([
														...selectUser,
														leftUsers.find(
															(i) =>
																i.db === item.db
														)
													]);
												}}
											>
												<Checkbox
													style={{
														width: 20,
														marginRight: 10
													}}
													checked={false}
												/>
												<span
													className="db-name"
													title={item.db}
												>
													{item.db}
												</span>
												<span
													style={{
														width: 50
													}}
												>
													{item.charset}
												</span>
											</li>
										);
									})}
								</ul>
								<div className="transfer-footer">
									<span
										onClick={() => {
											setUsers([]);
											setLeftUsers([]);
											setSelectUser(leftUsers);
											setRightUsers(leftUsers);
										}}
									>
										移动全部
									</span>
								</div>
							</div>
						</div>
						<div>
							<SwapOutlined />
						</div>
						<div className="transfer-box">
							<div className="transfer-title">已授权</div>
							<div style={{ overflowX: 'auto' }}>
								<div className="transfer-header">
									<Input
										style={{ width: '100%' }}
										addonBefore={<SearchOutlined />}
										placeholder="请输入数据库名称检索"
										value={rightSearch}
										onChange={(e) => {
											setRightSearch(e.target.value);
											e.target.value
												? setSelectUser(
														rightUsers.filter(
															(item: any) =>
																item.db.indexOf(
																	e.target
																		.value
																) !== -1
														)
												  )
												: setSelectUser(rightUsers);
										}}
									/>
									<div>
										<p>
											<span
												style={{
													width: '120px',
													textAlign: 'center'
												}}
											>
												数据库名称
											</span>
											<span
												style={{
													width: 300,
													textAlign: 'center'
												}}
											>
												数据库权限
											</span>
										</p>
									</div>
								</div>
								<ul className="transfer-content">
									{selectUser.map((item) => {
										return (
											<li key={item.db}>
												<span
													style={{
														width: 20,
														height: 28,
														marginRight: 10
													}}
													onClick={() => {
														setSelectUser(
															selectUser.filter(
																(i) =>
																	i.db !==
																	item.db
															)
														);
														setRightUsers(
															rightUsers.filter(
																(i) =>
																	i.db !==
																	item.db
															)
														);
														setUsers([
															...users,
															selectUser.find(
																(i) =>
																	i.db ===
																	item.db
															)
														]);
														setLeftUsers([
															...users,
															rightUsers.find(
																(i) =>
																	i.db ===
																	item.db
															)
														]);
													}}
												>
													<DeleteOutlined
														style={{
															color: 'rgb(1,112,204)',
															marginTop: 8
														}}
													/>
												</span>
												<span
													className="db-name"
													title={item.db}
												>
													{item.db}
												</span>
												<RadioGroup
													style={{ width: 365 }}
													value={String(
														item.authority
													)}
													onChange={(e) => {
														item.authority = Number(
															e.target.value
														);
														const index =
															selectUser.findIndex(
																(i) =>
																	i.db ===
																	item.db
															);
														selectUser.splice(
															index,
															1,
															item
														);
														setSelectUser([
															...selectUser
														]);
													}}
												>
													<Radio
														id={Math.random() + ''}
														value="1"
													>
														只读
													</Radio>
													<Radio
														id={Math.random() + ''}
														value="2"
													>
														读写（DDL+DML）
													</Radio>
													<Radio
														id={Math.random() + ''}
														value="3"
													>
														仅DDL
													</Radio>
													<Radio
														id={Math.random() + ''}
														value="4"
													>
														仅DML
													</Radio>
												</RadioGroup>
											</li>
										);
									})}
								</ul>
								<div className="transfer-footer">
									<span
										onClick={() => {
											setUsers([
												...leftUsers,
												...rightUsers
											]);
											setLeftUsers([
												...leftUsers,
												...rightUsers
											]);
											setSelectUser([]);
											setRightUsers([]);
										}}
									>
										移动全部
									</span>
								</div>
							</div>
						</div>
					</div>
				</FormItem>
			</Form>
		</Modal>
	);
}
