import React, { useEffect, useState, useRef } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message,
	Icon,
	Balloon,
	Transfer,
	Checkbox,
	Radio
} from '@alicloud/console-components';
import { createUser, updateUser } from '@/services/user';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { getUsers } from '@/services/user';

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
interface userFormProps {
	visible: boolean;
	onCreate: () => void;
	onCancel: () => void;
	data: any | undefined | null;
}
export default function UserForm(props: userFormProps): JSX.Element {
	const { visible, onCreate, onCancel, data } = props;
	const field: Field = Field.useField();
	const [users, setUsers] = useState<any[]>([]);
	const [leftUsers, setLeftUsers] = useState<any[]>([]);
	const [rightUsers, setRightUsers] = useState<any[]>([]);
	const [insertUser, setInsertUser] = useState<any[]>([]);
	const [selectUser, setSelectUser] = useState<any[]>([]);
	const [leftSearch, setLeftSearch] = useState<string>('');
	const [rightSearch, setRightSearch] = useState<string>('');
	const [checks, setChecks] = useState<boolean[]>([
		false,
		false,
		false,
		false
	]);

	useEffect(() => {
		if (data) {
			field.setValues({
				userName: data.userName,
				aliasName: data.aliasName,
				phone: data.phone,
				email: data.email
			});
		}
		getUserList();
	}, [data]);
	const onOk: () => void = () => {
		console.log(selectUser);

		field.validate((errors, values) => {
			if (errors) return;
			const sendData = {
				...(values as unknown as any)
			};
			if (data) {
				// * 修改用户
				updateUser(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '用户修改成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			} else {
				// * 创建用户
				createUser(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '用户创建成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};

	const getUserList = (sendData?: any) => {
		getUsers(sendData).then((res) => {
			if (!res.data) return;
			const user: any[] = [];
			res.data.userBy &&
				res.data.userBy.length &&
				res.data.userBy.find((item: any) => item.email) &&
				setSelectUser(
					res.data.userBy
						.filter((item: any) => item.email)
						.map((item: any) => item.id)
				);
			setRightUsers(
				res.data.userBy
					.filter((item: any) => item.email)
					.map((item: any) => item.id)
			);
			res.data.userBy &&
				res.data.userBy.length &&
				res.data.users.map((item: any) => {
					res.data.userBy.map((arr: any) => {
						arr.email && item.id === arr.id && user.push(item);
					});
				});
			setInsertUser(user);
			setUsers(
				res.data.users.map((item: any) => {
					return {
						...item,
						value: item.id,
						key: item.id,
						disabled: !item.email,
						label:
							item.email +
							item.phone +
							item.userName +
							item.aliasName +
							item.roleName
					};
				})
			);
			setLeftUsers(
				res.data.users.map((item: any) => {
					return {
						...item,
						value: item.id,
						key: item.id,
						disabled: !item.email,
						label:
							item.email +
							item.phone +
							item.userName +
							item.aliasName +
							item.roleName
					};
				})
			);
		});
	};

	const defaultTrigger = (
		<FormItem
			className="ne-required-ingress"
			labelTextAlign="left"
            labelCol={{span: 6.5}}
			asterisk={false}
			label="数据库密码"
			required
			requiredMessage="请输入数据库密码"
			pattern={pattern.aliasName}
			patternMessage="用户名只允许中文、英文大小写+数字组合，长度不可超过18字符"
            style={{width: 415}}
		>
			<Password
				name="newPassword"
				onChange={(value: string) => handleChange(value, 'new')}
				disabled={data ? true : false}
				placeholder="请输入"
				style={{ width: 300 }}
			/>
		</FormItem>
	);

	const handleChange = (value: string, type: string) => {
		if (type === 'new') {
			const temp = [...checks];
			if (/[A-Za-z]/.test(value)) {
				temp[0] = true;
			} else {
				temp[0] = false;
			}
			if (/\d/.test(value)) {
				temp[1] = true;
			} else {
				temp[1] = false;
			}
			if (
				value.includes('.') ||
				value.includes('@') ||
				value.includes('-')
			) {
				temp[2] = true;
			} else {
				temp[2] = false;
			}
			if (value.length >= 8 && value.length <= 16) {
				temp[3] = true;
			} else {
				temp[3] = false;
			}
			setChecks(temp);
		} else {
			const newValue = field.getValue('newPassword');
			if (value !== newValue) {
				field.setError('reNewPassword', '密码二次校验错误');
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
					required
					requiredMessage="请输入数据库账号"
					pattern={pattern.databaseUser}
					patternMessage="名称在1-32个字符之间，由字母、数字、中划线或下划线组成，不能包含其他特殊字符"
				>
					<Input
						name="userName"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入"
						style={{ width: 300 }}
					/>
				</FormItem>
				<Tooltip trigger={defaultTrigger} align="r">
					<ul>
						<li className={'edit-form-icon-style'}>
							{checks[0] ? (
								<Icon
									type="success-filling1"
									style={{
										color: '#68B642',
										marginRight: 4
									}}
									size="xs"
								/>
							) : (
								<Icon
									type="times-circle-fill"
									style={{
										color: '#Ef595C',
										marginRight: 4
									}}
									size="xs"
								/>
							)}
							<span>英文大写或小写</span>
						</li>
						<li className={'edit-form-icon-style'}>
							{checks[1] ? (
								<Icon
									type="success-filling1"
									style={{
										color: '#68B642',
										marginRight: 4
									}}
									size="xs"
								/>
							) : (
								<Icon
									type="times-circle-fill"
									style={{
										color: '#Ef595C',
										marginRight: 4
									}}
									size="xs"
								/>
							)}
							<span>数字</span>
						</li>
						<li className={'edit-form-icon-style'}>
							{checks[2] ? (
								<Icon
									type="success-filling1"
									style={{
										color: '#68B642',
										marginRight: 4
									}}
									size="xs"
								/>
							) : (
								<Icon
									type="times-circle-fill"
									style={{
										color: '#Ef595C',
										marginRight: 4
									}}
									size="xs"
								/>
							)}
							<span>
								&quot;.&quot;或&quot;@&quot;或&quot;-&quot;
							</span>
						</li>
						<li className={'edit-form-icon-style'}>
							{checks[3] ? (
								<Icon
									type="success-filling1"
									style={{
										color: '#68B642',
										marginRight: 4
									}}
									size="xs"
								/>
							) : (
								<Icon
									type="times-circle-fill"
									style={{
										color: '#Ef595C',
										marginRight: 4
									}}
									size="xs"
								/>
							)}
							<span>
								目前长度为
								{
									(
										(field.getValue(
											'newPassword'
										) as string) || ''
									).length
								}
								(长度需要8-16之间)
							</span>
						</li>
					</ul>
					要求：密码需要满足以上四个条件
				</Tooltip>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="密码二次输入"
					required
					requiredMessage="请输入二次确认密码"
					pattern={pattern.aliasName}
					patternMessage="用户名只允许中文、英文大小写+数字组合，长度不可超过18字符"
				>
					<Password
						name="password"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入"
						style={{ width: 300 }}
					/>
				</FormItem>
				<FormItem labelTextAlign="left" asterisk={false} label="备注">
					<TextArea
						name="email"
						trim={true}
						placeholder="限定200字符串"
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
												key={item.id}
												style={{
													cursor: item.email
														? 'pointer'
														: 'not-allowed',
													color: item.email
														? '#000'
														: '#ddd'
												}}
												onClick={() => {
													if (!item.email) return;

													setUsers(
														users.filter(
															(i) =>
																i.id !== item.id
														)
													);
													setLeftUsers(
														users.filter(
															(i) =>
																i.id !== item.id
														)
													);
													setSelectUser([
														...selectUser,
														users.find(
															(i) =>
																i.id === item.id
														)
													]);
													setRightUsers([
														...selectUser,
														users.find(
															(i) =>
																i.id === item.id
														)
													]);
												}}
											>
												<Checkbox
													style={{
														width: 20,
														marginRight: 10
													}}
													disabled={!item.email}
													checked={false}
												/>
												<span
													style={{
														width: 100
													}}
												>
													{item?.userName}
												</span>
												<span
													style={{
														width: 50
													}}
												>
													utf-8
												</span>
											</li>
										);
									})}
								</ul>
								<div className="transfer-footer">
									<span
										onClick={() => {
											setUsers(
												users.filter(
													(item) => !item.email
												)
											);
											setLeftUsers(
												users.filter(
													(item) => !item.email
												)
											);
											setSelectUser(
												users.filter(
													(item) => item.email
												)
											);
											setRightUsers(
												users.filter(
													(item) => item.email
												)
											);
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
											<li key={item.id}>
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
																	i.id !==
																	item.id
															)
														);
														setRightUsers(
															selectUser.filter(
																(i) =>
																	i.id !==
																	item.id
															)
														);
														setUsers([
															...users,
															selectUser.find(
																(i) =>
																	i.id ===
																	item.id
															)
														]);
														setLeftUsers([
															...users,
															selectUser.find(
																(i) =>
																	i.id ===
																	item.id
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
													{item.userName}
												</span>
												<RadioGroup
													style={{ width: 350 }}
													value={String(item.roleId)}
													onChange={(value) => {
														item.roleId =
															Number(value);
														const index =
															selectUser.findIndex(
																(i) =>
																	i.id ===
																	item.id
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
