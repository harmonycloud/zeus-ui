import React, { useEffect, useState, useRef } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message,
	Icon,
	Balloon,
	Checkbox,
	Radio
} from '@alicloud/console-components';
import { createUser, grantUser, listDb } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { FormProps } from './database';

import styles from '@/layouts/Navbar/User/./user.module.scss';

const FormItem = Form.Item;
const Password = Input.Password;
const TextArea = Input.TextArea;
const Tooltip = Balloon.Tooltip;
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
	const field: Field = Field.useField();
	const [users, setUsers] = useState<any[]>([]);
	const [leftUsers, setLeftUsers] = useState<any[]>([]);
	const [rightUsers, setRightUsers] = useState<any[]>([]);
	const [selectUser, setSelectUser] = useState<any[]>([]);
	const [leftSearch, setLeftSearch] = useState<string>('');
	const [rightSearch, setRightSearch] = useState<string>('');
	const [checks, setChecks] = useState<boolean[]>([false, false]);
	const [error,setError] = useState<boolean>(false);

	useEffect(() => {
		if (data) {
			field.setValues({
				user: data.user,
				password: data.password,
				newPassword: data.newPassword,
				description: data.description
			});
		}
		getUserList();
	}, [data]);
	const onOk: () => void = () => {
		field.validate((errors, values: any) => {
			if (errors) return;
			if(error){
				Message.show(
					messageConfig('error', '失败', '二次密码不一致')
				);
				return;
			}
			if (!selectUser.length) {
				Message.show(
					messageConfig('error', '失败', '请选择授权数据库')
				);
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
						Message.show(
							messageConfig('success', '成功', '用户修改成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res.errorMsg));
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
						Message.show(
							messageConfig('success', '成功', '用户创建成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res.errorMsg));
					}
				});
			}
		});
	};

	const getUserList = (sendData?: any) => {
		listDb({ clusterId, namespace, middlewareName }).then((res) => {
			if (res.success) {
				if (data) {
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
					setSelectUser(
						data.dbs.map((item: any) => {
							return {
								id: item.id,
								authority: item.authority
									? item.authority
									: '2',
								db: item.db,
								charset: item.charset
							};
						})
					);
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
				}
			} else {
				Message.show(messageConfig('error', '失败', res.errorMsg));
			}
		});
	};

	const defaultTrigger = (
		<FormItem
			className="ne-required-ingress"
			labelTextAlign="left"
			labelCol={{ span: 6.5 }}
			asterisk={false}
			label="数据库密码"
			required={!data}
			requiredMessage="请输入数据库密码"
			pattern={pattern.aliasName}
			patternMessage="用户名只允许中文、英文大小写+数字组合，长度不可超过18字符"
			style={{ width: 415 }}
		>
			<Password
				name="password"
				onChange={(value: string) => handleChange(value, 'new')}
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
				/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{3,32}$/.test(
					value
				)
			) {
				temp[1] = true;
			} else {
				temp[1] = false;
			}
			setChecks(temp);
		} else {
			const newValue = field.getValue('password');
			if (value !== newValue) {
				// field.setError('confirmPassword', '密码二次校验错误');
				setError(true);
			}else{
				setError(false);
			}
		}
	};
	return (
		<Dialog
			title={!data ? '新增用户' : '编辑用户'}
			visible={visible}
			footerAlign="right"
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
		>
			<Form field={field} {...formItemLayout} style={{ paddingLeft: 12 }}>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label={
						<div>
							<span style={{ marginRight: 4 }}>数据库账号</span>
							<Balloon
								trigger={
									<Icon
										type="question-circle"
										size="xs"
										style={{ cursor: 'pointer' }}
									/>
								}
								closable={false}
							>
								名称在1-32个字符之间，由字母、数字、中划线或下划线组成，不能包含其他特殊字符
							</Balloon>
						</div>
					}
					required={!data}
					requiredMessage="请输入数据库账号"
					pattern={pattern.databaseUser}
					patternMessage="名称在1-32个字符之间，由字母、数字、中划线或下划线组成，不能包含其他特殊字符"
				>
					<Input
						name="user"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入内容"
						style={{ width: 300 }}
					/>
				</FormItem>
				<Tooltip trigger={defaultTrigger} align="r">
					<ul>
						<li className={styles['edit-form-icon-style']}>
							{checks[0] ? (
								<Icon
									type="success-filling1"
									style={{ color: '#68B642', marginRight: 4 }}
									size="xs"
								/>
							) : (
								<Icon
									type="times-circle-fill"
									style={{ color: '#Ef595C', marginRight: 4 }}
									size="xs"
								/>
							)}
							<span>(长度需要8-32之间)</span>
						</li>
						<li className={styles['edit-form-icon-style']}>
							{checks[1] ? (
								<Icon
									type="success-filling1"
									style={{ color: '#68B642', marginRight: 4 }}
									size="xs"
								/>
							) : (
								<Icon
									type="times-circle-fill"
									style={{ color: '#Ef595C', marginRight: 4 }}
									size="xs"
								/>
							)}
							<span>
								至少包含以下字符中的三种：大写字母、小写字母、数字和特殊字符～!@%^*-_=+?,()&
							</span>
						</li>
					</ul>
				</Tooltip>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="密码二次输入"
					required={!data}
					requiredMessage="请输入二次确认密码"
				>
					<Password
						name="confirmPassword"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入内容"
						style={{ width: 300 }}
						onChange={(value: string) =>
							handleChange(value, 'newPassword')
						}
					/>
				</FormItem>
				<FormItem labelTextAlign="left" asterisk={false} label="备注">
					<TextArea
						name="description"
						trim={true}
						placeholder="限定200字符串"
						maxLength={200}
						style={{ width: 300 }}
					/>
				</FormItem>
				<FormItem labelTextAlign="left" label="数据库授权" required>
					<div className="transfer">
						<div className="transfer-box">
							<div className="transfer-title">未授权数据库</div>
							<div style={{ overflowX: 'auto' }}>
								<div className="transfer-header">
									<Input
										style={{ width: '100%' }}
										innerBefore={
											<Icon
												type="search"
												style={{ margin: 4 }}
											/>
										}
										placeholder="请输入数据库名称检索"
										value={leftSearch}
										onChange={(value) => {
											setLeftSearch(value);
											value
												? setUsers(
														leftUsers.filter(
															(item: any) =>
																item.userName.indexOf(
																	value
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
													width: 100,
													marginLeft: '50px'
												}}
											>
												数据库名称
											</span>
											<span
												style={{
													width: 50
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
														users.filter(
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
														users.find(
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
													style={{
														width: 100
													}}
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
											setSelectUser(users);
											setRightUsers(users);
										}}
									>
										移动全部
									</span>
								</div>
							</div>
						</div>
						<div>
							<Icon type="switch" />
						</div>
						<div className="transfer-box">
							<div className="transfer-title">已授权</div>
							<div style={{ overflowX: 'auto' }}>
								<div className="transfer-header">
									<Input
										style={{ width: '100%' }}
										innerBefore={
											<Icon
												type="search"
												style={{ margin: 4 }}
											/>
										}
										placeholder="请输入数据库名称检索"
										value={rightSearch}
										onChange={(value) => {
											setRightSearch(value);
											value
												? setSelectUser(
														rightUsers.filter(
															(item: any) =>
																item.userName.indexOf(
																	value
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
													width: 100,
													marginLeft: '50px'
												}}
											>
												数据库名称
											</span>
											<span
												style={{
													width: 250,
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
															selectUser.filter(
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
															selectUser.find(
																(i) =>
																	i.db ===
																	item.db
															)
														]);
													}}
												>
													<Icon
														type="ashbin"
														size="xs"
														style={{
															color: 'rgb(1,112,204)',
															marginTop: 8
														}}
													/>
												</span>
												<span
													style={{
														width: 100
													}}
												>
													{item.db}
												</span>
												<RadioGroup
													style={{ width: 350 }}
													value={String(
														item.authority
													)}
													onChange={(value) => {
														item.authority =
															Number(value);
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
														id={String(
															item.id + '1'
														)}
														value="1"
													>
														只读
													</Radio>
													<Radio
														id={String(
															item.id + '2'
														)}
														value="2"
													>
														读写（DDL+DML）
													</Radio>
													<Radio
														id={String(
															item.id + '3'
														)}
														value="3"
													>
														仅DDL
													</Radio>
													<Radio
														id={String(
															item.id + '4'
														)}
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
											setUsers([...users, ...selectUser]);
											setLeftUsers([
												...users,
												...selectUser
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
		</Dialog>
	);
}
