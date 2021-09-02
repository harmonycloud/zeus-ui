import React, { useState, useEffect } from 'react';
import {
	Icon,
	Form,
	Input,
	Grid,
	Radio,
	Select,
	Switch
} from '@alicloud/console-components';
// import { findDOMNode } from 'react-dom';
import { userConfigProps, authProps, visibleProps } from './acl';
import { judgeObjArrayHeavyByAttr } from '@/utils/utils';
// todo 优化点
// todo 方法一、对于topicPerm 和 groupPerm 的处理 可以更为简洁 可以尝试 Object.entries() 将对象转成一个二维数组 在通过Object.fromEntries 将二位数组重新转换成对象
// todo 方法二、可以使用Map对象，通过setMap等函数来处理数据，最后通过Object.fromEntries(map) 可以转换成对象
const { Item: FormItem } = Form;
const { Group: RadioGroup } = Radio;
const { Row, Col } = Grid;
const { Option } = Select;
enum stateProps {
	'error' = 'error',
	'loading' = 'loading',
	'success' = 'success',
	'warning' = 'warning'
}
export default function UserConfig(props: userConfigProps): JSX.Element {
	const { deleteUserConfigProps, userConfig, setUserConfig } = props;
	const [visible, setVisible] = useState<boolean>(false);
	const [topicCustom, setTopicCustom] = useState<boolean>(false);
	const [groupCustom, setGroupCustom] = useState<boolean>(false);
	const [data, setData] = useState({
		id: userConfig.id,
		accessKey: userConfig.accessKey,
		secretKey: userConfig.secretKey,
		topicPerms: userConfig.topicPerms,
		groupPerms: userConfig.groupPerms,
		admin: userConfig.admin,
		whiteRemoteAddress: userConfig.whiteRemoteAddress
	});
	const [topics, setTopics] = useState<authProps[]>([]);
	const [groups, setGroups] = useState<authProps[]>([]);
	const [nameState, setNameState] = useState<stateProps>();
	const [passwordState, setPasswordState] = useState<stateProps>();
	const [errorVisible, setErrorVisible] = useState<visibleProps>({
		topicsVisible: false,
		groupsVisible: false
	});
	useEffect(() => {
		// * init topics groups
		const keys = Object.keys(data.topicPerms);
		const list = keys.map((item: string) => {
			return {
				key: item,
				value: data.topicPerms[item]
			};
		});
		list.sort((a, b) => {
			if (a.key === 'defaultTopicPerm') return -1;
			return 1;
		});
		setTopics(list);
		const keys2 = Object.keys(data.groupPerms);
		const list2 = keys2.map((item: string) => {
			return {
				key: item,
				value: data.groupPerms[item]
			};
		});
		list2.sort((a, b) => {
			if (a.key === 'defaultGroupPerm') return -1;
			return 1;
		});
		setGroups(list2);
		if (list.length > 1) {
			setTopicCustom(true);
		}
		if (list2.length > 1) {
			setGroupCustom(true);
		}
	}, []);
	useEffect(() => {
		const obj: any = {};
		setErrorVisible({
			...errorVisible,
			topicsVisible: judgeObjArrayHeavyByAttr(topics, 'key')
		});
		topics.map((item) => {
			obj[item.key] = item.value;
		});
		changeData(obj, 'topicPerms');
	}, [topics]);
	useEffect(() => {
		const obj: any = {};
		setErrorVisible({
			...errorVisible,
			groupsVisible: judgeObjArrayHeavyByAttr(groups, 'key')
		});
		groups.map((item) => {
			obj[item.key] = item.value;
		});
		changeData(obj, 'groupPerms');
	}, [groups]);
	useEffect(() => {
		setUserConfig(data);
	}, [data]);

	const handleClick = () => {
		setVisible(!visible);
	};
	const deleteUserConfig = (e: any) => {
		e.stopPropagation();
		e.nativeEvent.stopImmediatePropagation();
		deleteUserConfigProps(Number(userConfig.id));
	};
	const changeData = (value: string | boolean | any, key: string) => {
		setData({
			...data,
			[key]: value
		});
		if (key === 'accessKey') {
			if (value.length > 6 && value.length <= 20) {
				setNameState(stateProps.success);
			} else {
				setNameState(stateProps.error);
			}
		}
		if (key === 'secretKey') {
			if (value.length > 6 && value.length <= 20) {
				setPasswordState(stateProps.success);
			} else {
				setPasswordState(stateProps.error);
			}
		}
	};
	const handleSwitch = (value: boolean, type: string) => {
		if (type === 'topic') {
			if (!value) setTopics([{ key: 'defaultTopicPerm', value: 'DENY' }]);
			setTopicCustom(value);
		} else {
			if (!value) setGroups([{ key: 'defaultGroupPerm', value: 'DENY' }]);
			setGroupCustom(value);
		}
		if (value) addAuth(type);
	};
	const addAuth = (type: string) => {
		if (type === 'topic') {
			const list = [...topics, { key: '', value: 'DENY' }];
			setTopics(list);
		} else {
			const list = [...groups, { key: '', value: 'DENY' }];
			setGroups(list);
		}
	};
	const deleteAuth = (index: number, type: string) => {
		if (type === 'topic') {
			if (topics.length === 2 && index === 1) return;
			const list = topics.filter((item, i) => i !== index);
			setTopics(list);
		} else {
			if (groups.length === 2 && index === 1) return;
			const list = groups.filter((item, i) => i !== index);
			setGroups(list);
		}
	};
	const handleAuthChange = (value: string, type: string, index: number) => {
		if (type === 'topicKey') {
			setTopics(
				topics.map((item, i) => {
					if (i === index) {
						item.key = value;
					}
					return item;
				})
			);
		} else {
			setGroups(
				groups.map((item, i) => {
					if (i === index) {
						item.key = value;
					}
					return item;
				})
			);
		}
	};
	const handleSelectChange = (value: string, type: string, index: number) => {
		switch (type) {
			case 'topicValue':
				setTopics(
					topics.map((item, i) => {
						if (i === index) {
							item.value = value;
						}
						return item;
					})
				);
				break;
			case 'groupValue':
				setGroups(
					groups.map((item, i) => {
						if (i === index) {
							item.value = value;
						}
						return item;
					})
				);
				break;
			default:
				break;
		}
	};
	return (
		<div>
			<div className="acl-user-config" onClick={handleClick}>
				<div className="acl-user-title">
					<Icon
						type="arrow-right"
						size="small"
						style={{
							marginRight: 6,
							color: '#575757',
							transition: 'transform .05s linear',
							transform: visible ? 'rotate(450deg)' : ''
						}}
					/>
					账户信息
				</div>
				<div className="acl-user-close">
					<Icon
						type="close"
						size="small"
						onClick={(e) => deleteUserConfig(e)}
					/>
				</div>
			</div>
			{visible && (
				<ul className="acl-config-list">
					<li className="display-flex" style={{ width: '50%' }}>
						<label className="form-name">
							<span
								className="ne-required"
								style={{ marginRight: 8 }}
							>
								账户密码
							</span>
						</label>
						<div className="form-content">
							<Row gutter="4">
								<Col>
									<FormItem
										required
										requiredMessage="长度在7个字符-20字符"
										minmaxLengthMessage="长度在7个字符-20字符"
										validateState={nameState}
										help={
											nameState === 'error'
												? '长度在7个字符-20字符'
												: ''
										}
									>
										<Input
											value={data.accessKey}
											placeholder="请输入用户名"
											onChange={(value) =>
												changeData(value, 'accessKey')
											}
											minLength={6}
											maxLength={20}
										/>
									</FormItem>
								</Col>
								<Col>
									<FormItem
										required
										requiredMessage="长度在7个字符-20字符"
										minmaxLengthMessage="长度在7个字符-20字符"
										validateState={passwordState}
										help={
											passwordState === 'error'
												? '长度在7个字符-20字符'
												: ''
										}
									>
										<Input.Password
											value={data.secretKey}
											placeholder="请输入密码"
											onChange={(value) =>
												changeData(value, 'secretKey')
											}
											minLength={6}
											maxLength={20}
										/>
									</FormItem>
								</Col>
							</Row>
						</div>
					</li>
					<li
						className="display-flex"
						style={{ width: '50%', height: 48 }}
					>
						<label className="form-name">
							<span style={{ marginRight: 8 }}>是否为admin</span>
						</label>
						<div className="form-content">
							<Row>
								<RadioGroup
									name="admin"
									value={data.admin}
									onChange={(value) =>
										changeData(value, 'admin')
									}
								>
									<Radio value={false}>否</Radio>
									<Radio value={true}>是</Radio>
								</RadioGroup>
							</Row>
						</div>
					</li>
					<li
						className="display-flex"
						style={{ width: '50%', height: 48 }}
					>
						<label className="form-name">
							<span style={{ marginRight: 8 }}>用户IP白名单</span>
						</label>
						<div className="form-content">
							<Input
								style={{
									width: '100%'
								}}
								placeholder="请输入IP白名单"
								value={data.whiteRemoteAddress}
								onChange={(value) =>
									changeData(value, 'whiteRemoteAddress')
								}
								maxLength={20}
							/>
						</div>
					</li>
					<li className="display-flex" style={{ height: 48 }}>
						<label className="form-name">
							<span style={{ marginRight: 8 }}>Topic权限</span>
						</label>
						<div className="form-content">
							<Row>
								<Input
									placeholder="默认Topic权限"
									style={{ width: '22%' }}
									disabled={true}
									value="defaultTopicPerm"
								/>
								<span className="acl-equal">=</span>
								<Select
									style={{ width: '22%' }}
									onChange={(value: string) =>
										handleSelectChange(
											value,
											'topicValue',
											0
										)
									}
									defaultValue="DENY"
								>
									<Option value="DENY">DENY</Option>
									<Option value="PUB">PUB</Option>
									<Option value="SUB">SUB</Option>
									<Option value="PUB|SUB">PUB|SUB</Option>
								</Select>
								<span className="acl-custom-label">自定义</span>
								<Switch
									style={{
										marginLeft: 16,
										verticalAlign: 'middle',
										marginTop: 5
									}}
									size="small"
									checked={topicCustom}
									onChange={(value: boolean) =>
										handleSwitch(value, 'topic')
									}
								/>
							</Row>
						</div>
					</li>
					{topicCustom
						? topics.map((item: authProps, index: number) => {
								if (index !== 0) {
									return (
										<li
											key={index}
											className="display-flex"
											style={{
												height: 48
											}}
										>
											<label className="form-name">
												<span></span>
											</label>
											<div className="form-content">
												<Input
													placeholder="默认Topic权限"
													style={{
														width: '22%'
													}}
													value={item.key}
													onChange={(value) =>
														handleAuthChange(
															value,
															'topicKey',
															index
														)
													}
													maxLength={20}
												/>
												<span className="acl-equal">
													=
												</span>
												<Select
													defaultValue="DENY"
													style={{
														width: '22%'
													}}
													onChange={(value: string) =>
														handleSelectChange(
															value,
															'topicValue',
															index
														)
													}
													value={item.value}
												>
													<Option value="DENY">
														DENY
													</Option>
													<Option value="PUB">
														PUB
													</Option>
													<Option value="SUB">
														SUB
													</Option>
													<Option value="PUB|SUB">
														PUB|SUB
													</Option>
												</Select>
												<Icon
													type="plus-circle-fill"
													size="small"
													style={{
														marginLeft: 16,
														color: '#0064C8'
													}}
													onClick={() =>
														addAuth('topic')
													}
												/>
												<Icon
													type="minus-circle-fill"
													size="small"
													style={{
														marginLeft: 10,
														color:
															topics.length ===
																2 && index === 1
																? '#CCCCCC'
																: '#C80000',
														cursor:
															topics.length ===
																2 && index === 1
																? 'not-allowed'
																: 'pointer'
													}}
													onClick={() =>
														deleteAuth(
															index,
															'topic'
														)
													}
												/>
											</div>
										</li>
									);
								}
						  })
						: null}
					{errorVisible.topicsVisible && (
						<div className="acl-error-text">
							不能设置相同key值的Topic权限,设置相同的key值默认设置最后一个
						</div>
					)}
					<li className="display-flex" style={{ height: 48 }}>
						<label className="form-name">
							<span style={{ marginRight: 8 }}>消费者权限</span>
						</label>
						<div className="form-content">
							<Row>
								<Input
									placeholder="默认消费者权限"
									style={{ width: '22%' }}
									disabled={true}
									value="defaultGroupPerm"
								/>
								<span className="acl-equal">=</span>
								<Select
									defaultValue="DENY"
									style={{ width: '22%' }}
									onChange={(value: string) =>
										handleSelectChange(
											value,
											'groupValue',
											0
										)
									}
								>
									<Option value="DENY">DENY</Option>
									<Option value="PUB">PUB</Option>
									<Option value="SUB">SUB</Option>
									<Option value="PUB|SUB">PUB|SUB</Option>
								</Select>
								<span className="acl-custom-label">自定义</span>
								<Switch
									style={{
										marginLeft: 16,
										verticalAlign: 'middle',
										marginTop: 5
									}}
									size="small"
									checked={groupCustom}
									onChange={(value: boolean) =>
										handleSwitch(value, 'group')
									}
								/>
							</Row>
						</div>
					</li>
					{groupCustom
						? groups.map((item, index) => {
								if (index !== 0) {
									return (
										<li
											key={index}
											className="display-flex"
											style={{ height: 48 }}
										>
											<label className="form-name">
												<span></span>
											</label>
											<div className="form-content">
												<Input
													placeholder="默认消费者权限"
													style={{
														width: '22%'
													}}
													value={item.key}
													onChange={(value) =>
														handleAuthChange(
															value,
															'groupKey',
															index
														)
													}
													maxLength={20}
												/>
												<span className="acl-equal">
													=
												</span>
												<Select
													defaultValue="DENY"
													style={{
														width: '22%'
													}}
													onChange={(value: string) =>
														handleSelectChange(
															value,
															'groupValue',
															index
														)
													}
													value={item.value}
												>
													<Option value="DENY">
														DENY
													</Option>
													<Option value="PUB">
														PUB
													</Option>
													<Option value="SUB">
														SUB
													</Option>
													<Option value="PUB|SUB">
														PUB|SUB
													</Option>
												</Select>
												<Icon
													type="plus-circle-fill"
													size="small"
													style={{
														marginLeft: 16,
														color: '#0064C8'
													}}
													onClick={() =>
														addAuth('groups')
													}
												/>
												<Icon
													type="minus-circle-fill"
													size="small"
													style={{
														marginLeft: 10,
														color:
															groups.length ===
																2 && index === 1
																? '#CCCCCC'
																: '#C80000',
														cursor:
															groups.length ===
																2 && index === 1
																? 'not-allowed'
																: 'pointer'
													}}
													onClick={() =>
														deleteAuth(
															index,
															'groups'
														)
													}
												/>
											</div>
										</li>
									);
								}
						  })
						: null}
					{errorVisible.groupsVisible && (
						<div className="acl-error-text">
							不能设置相同key值的消费者权限,设置相同的key值默认设置最后一个
						</div>
					)}
				</ul>
			)}
		</div>
	);
}
