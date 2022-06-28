import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import {
	Button,
	Space,
	Steps,
	Form,
	Row,
	Col,
	Input,
	notification,
	InputNumber,
	Select,
	Modal
} from 'antd';
import FormBlock from '@/components/FormBlock';
import { setRefreshCluster } from '@/redux/globalVar/var';
import OtherResourcePoolImg from '@/assets/images/other-resource-pool.svg';
import { filtersProps } from '@/types/comment';
import './index.scss';
import { IconFont } from '@/components/IconFont';
import {
	CodeFilled,
	ExclamationCircleOutlined,
	FormOutlined,
	VerticalAlignTopOutlined
} from '@ant-design/icons';
import pattern from '@/utils/pattern';
import { getJoinCommand, postCluster } from '@/services/common';
import storage from '@/utils/storage';
import { connect } from 'react-redux';
import { clusterAddType } from '@/types';
import { AddResourcePoolProps } from './resource.pool';

const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};

const options: filtersProps[] = [
	{
		value: 'fast',
		label: '快捷模式',
		content: '通过自动生成指令，由用户自主运行指令完成集群的创建',
		icon: <CodeFilled />
	},
	{
		value: 'form',
		label: '表单模式',
		content: '依靠平台输入集群创建的所需要的一系列字段创建集群',
		icon: <FormOutlined />
	}
];
const { Step } = Steps;
const FormItem = Form.Item;
const { confirm } = Modal;
function AddResourcePool(props: AddResourcePoolProps): JSX.Element {
	const { setRefreshCluster } = props;
	const history = useHistory();
	const [form] = Form.useForm();
	const [current, setCurrent] = useState<number>(0);
	const [mode, setMode] = useState<string>('fast');
	// const [quickName, setQuickName] = useState<string>('');
	const [command, setCommand] = useState<string>('');
	const onBlur = () => {
		form.validateFields().then((values) => {
			const apiAddress =
				window.location.protocol.toLowerCase() === 'https:'
					? `https://${window.location.hostname}:${window.location.port}/api`
					: `http://${window.location.hostname}:${window.location.port}/api`;
			const sendData = {
				name: values.name,
				apiAddress: apiAddress,
				address: values.addressHarbor,
				password: values.password,
				port: values.portHarbor,
				protocol: values.protocolHarbor,
				user: values.user
			};
			getJoinCommand(sendData).then((res) => {
				if (res.success) {
					setCommand(res.data);
				} else {
					setCommand('');
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};
	// * 浏览器复制到剪切板方法
	const copyValue = () => {
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.style.position = 'absolute';
		input.style.top = '0px';
		input.style.opacity = '0';
		input.value = command;
		input.focus();
		input.select();
		if (document.execCommand('copy')) {
			document.execCommand('copy');
		}
		input.blur();
		document.body.removeChild(input);
		confirm({
			title: '复制成功',
			icon: <ExclamationCircleOutlined />,
			content: '集群接入指令已完成生成，是否已运行代码？',
			okText: '已运行',
			cancelText: '未运行',
			onOk: () => {
				history.push('/systemManagement/resourcePoolManagement');
			}
		});
	};
	const uploadConf = (e: any) => {
		const reader = new window.FileReader();
		reader.onload = function (e) {
			form.setFieldsValue({
				cert: reader.result
			});
		};
		reader.readAsText(e.target.files[0]);
	};

	const handleSubmit = () => {
		if (mode === 'fast') {
			history.push('/systemManagement/resourcePoolManagement');
		} else {
			form.validateFields().then((values) => {
				const sendData: clusterAddType = {
					cert: {
						certificate: values.cert
					},
					name: values.name,
					nickname: values.nickname,
					host: values.host,
					protocol: values.protocol,
					port: values.port,
					activeActive: values.activeActive,
					registry: {
						protocol: values.protocolHarbor,
						address: values.addressHarbor,
						port: values.portHarbor,
						user: values.user,
						password: values.password,
						type: 'harbor',
						chartRepo: values.chartRepo
					}
				};
				postCluster(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '集群接入成功'
						});
						setRefreshCluster(true);
						storage.setLocal(
							'cluster-detail-current-tab',
							'component'
						);
						history.push(
							`/systemManagement/resourcePoolManagement/resourcePoolDetail/default--${sendData.name}/${sendData.nickname}`
						);
					} else {
						notification.error({
							message: '错误',
							description: res.errorMsg
						});
					}
				});
			});
		}
	};
	const childrenRender = (c: number) => {
		switch (c) {
			case 0:
				return (
					<FormBlock title="纳管现有集群">
						<div className="resource-pool-content">
							<img
								src={OtherResourcePoolImg}
								width={80}
								height={80}
							/>
							<div>基于已有集群</div>
							<IconFont type="icon-xuanzhong" />
						</div>
					</FormBlock>
				);
			case 1:
				return (
					<FormBlock title="选择模式">
						<div className="zeus-model-select-content">
							{options.map((item: filtersProps) => {
								return (
									<div
										className={`zeus-model-select-item ${
											mode === item.value
												? 'zeus-model-select-item-active'
												: ''
										}`}
										key={item.value}
										onClick={() =>
											setMode(item.value as string)
										}
									>
										<h2>{item.label}</h2>
										<p>{item.content}</p>
										<span>
											{item.value === 'fast' ? (
												<CodeFilled
													style={{
														fontSize: 48,
														color:
															mode === item.value
																? '#226ee7'
																: '#E3E4E6'
													}}
												/>
											) : (
												<FormOutlined
													style={{
														fontSize: 48,
														color:
															mode === item.value
																? '#226ee7'
																: '#E3E4E6'
													}}
												/>
											)}
										</span>
									</div>
								);
							})}
						</div>
					</FormBlock>
				);
			case 2:
				if (mode === 'fast') {
					return (
						<FormBlock title="基础信息">
							<Form
								labelAlign="left"
								{...formItemLayout}
								form={form}
							>
								<FormItem
									style={{ width: '50%', marginLeft: 12 }}
									label="英文简称"
									rules={[
										{
											required: true,
											message: '请输入英文简称'
										},
										{
											pattern: new RegExp(pattern.name),
											message:
												'请输入由小写字母数字及“-”组成的2-40个字符'
										}
									]}
									name="name"
									required
								>
									<Input placeholder="请输入集群名称生成集群纳管脚本" />
								</FormItem>
								<FormItem
									label="镜像仓库地址"
									style={{
										width: '50%',
										marginLeft: 12,
										marginBlock: 0
									}}
									name="harborAddress"
								>
									<Row>
										<Col span={6}>
											<FormItem
												name="protocolHarbor"
												initialValue={'https'}
											>
												<Select
													style={{ width: '100%' }}
												>
													<Select.Option value="https">
														https
													</Select.Option>
													<Select.Option value="http">
														http
													</Select.Option>
												</Select>
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem
												style={{ marginLeft: -2 }}
												name="addressHarbor"
											>
												<Input
													type="text"
													placeholder="请输入主机地址"
												/>
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem
												style={{ marginLeft: -2 }}
												name="portHarbor"
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="端口"
												/>
											</FormItem>
										</Col>
									</Row>
								</FormItem>
								<FormItem
									style={{ width: '50%', marginLeft: 12 }}
									label="镜像仓库项目"
									name="chartRepo"
								>
									<Input placeholder="请输入镜像仓库项目" />
								</FormItem>
								<FormItem
									label="镜像仓库鉴权"
									style={{
										width: '50%',
										marginLeft: 12,
										marginBottom: 0
									}}
									name="harborAuth"
								>
									<Row gutter={4}>
										<Col span={12}>
											<FormItem name="user">
												<Input placeholder="请输入用户名" />
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem name="password">
												<Input.Password placeholder="请输入密码" />
											</FormItem>
										</Col>
									</Row>
								</FormItem>
							</Form>
							<Button
								style={{ marginBottom: 16, marginLeft: 12 }}
								type="primary"
								onClick={onBlur}
							>
								生成
							</Button>
							<div className="quick-model-content">
								<div className="quick-model-title">
									在已有集群的任意一个master节点上运行以下指令，实现集群纳管
									<span style={{ color: '#Ef595C' }}>
										(前提：已装好Docker)
									</span>
								</div>
								<div className="display-flex">
									<div className="quick-model-text">
										{command}
									</div>
									<div
										className="quick-model-copy"
										onClick={copyValue}
									>
										<IconFont
											type="icon-fuzhi1"
											style={{
												color: '#FFFFFF',
												marginLeft: 7,
												marginTop: 40,
												cursor: 'pointer',
												fontSize: 32
											}}
										/>
									</div>
								</div>
							</div>
						</FormBlock>
					);
				} else {
					return (
						<FormBlock title="基础信息">
							<Form
								{...formItemLayout}
								form={form}
								labelAlign="left"
								style={{ width: '50%', paddingLeft: 12 }}
							>
								<FormItem
									label="英文简称"
									required
									rules={[
										{
											required: true,
											message: '请输入英文简称'
										},
										{
											pattern: new RegExp(pattern.name),
											message:
												'请输入由小写字母数字及“-”组成的2-40个字符'
										}
									]}
									name="name"
								>
									<Input placeholder="请输入英文简称" />
								</FormItem>
								<FormItem
									label="显示名称"
									required
									rules={[
										{
											required: true,
											message: '请输入显示名称'
										},
										{
											max: 80,
											message:
												'请输入名称，且最大长度不超过80个字符'
										}
									]}
									name="nickname"
								>
									<Input placeholder="请输入显示名称" />
								</FormItem>
								<FormItem
									label="Apiserver地址"
									style={{ marginBottom: 0 }}
									name="apiserver"
								>
									<Row>
										<Col span={6}>
											<FormItem
												name="protocol"
												initialValue="https"
											>
												<Input
													style={{ width: '100%' }}
													value="https"
													disabled={true}
												/>
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem
												required
												name="host"
												rules={[
													{
														required: true,
														message: '请输入地址'
													},
													{
														pattern: new RegExp(
															pattern.ip
														),
														message:
															'请输入正确的ip地址！'
													}
												]}
												style={{ marginLeft: -2 }}
											>
												<Input
													style={{
														width: '100%'
													}}
													placeholder="请输入主机地址"
												/>
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem
												style={{ marginLeft: -2 }}
												required
												name="port"
												rules={[
													{
														required: true,
														message: '请输入端口'
													}
												]}
												initialValue={6443}
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="端口"
												/>
											</FormItem>
										</Col>
									</Row>
								</FormItem>
								<FormItem
									label="AdminConfig"
									style={{ marginBottom: 0 }}
								>
									<FormItem
										name="cert"
										required
										rules={[
											{
												required: true,
												message: '请输入AdminConfig'
											}
										]}
									>
										<Input.TextArea
											rows={4}
											placeholder="请输入AdminConfig"
										/>
									</FormItem>
									<Form.Item className="upload-parse-file">
										<div>
											<VerticalAlignTopOutlined
												style={{ marginRight: 4 }}
											/>
											上传文件
											<input
												id="my-upload-parse"
												type="file"
												name="file"
												onChange={uploadConf}
											/>
										</div>
									</Form.Item>
								</FormItem>
								<FormItem
									label="镜像仓库地址"
									style={{ marginBottom: 0 }}
									name="harborAddress"
								>
									<Row>
										<Col span={6}>
											<FormItem
												name="protocolHarbor"
												initialValue={'https'}
											>
												<Select
													style={{ width: '100%' }}
												>
													<Select.Option value="https">
														https
													</Select.Option>
													<Select.Option value="http">
														http
													</Select.Option>
												</Select>
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem
												style={{ marginLeft: -2 }}
												name="addressHarbor"
											>
												<Input
													type="text"
													placeholder="请输入主机地址"
												/>
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem
												style={{ marginLeft: -2 }}
												name="portHarbor"
											>
												<InputNumber
													style={{ width: '100%' }}
													placeholder="端口"
												/>
											</FormItem>
										</Col>
									</Row>
								</FormItem>
								<FormItem label="镜像仓库项目" name="chartRepo">
									<Input placeholder="请输入镜像仓库项目" />
								</FormItem>
								<FormItem
									label="镜像仓库鉴权"
									style={{ marginBottom: 0 }}
									name="harborAuth"
								>
									<Row gutter={4}>
										<Col span={12}>
											<FormItem name="user">
												<Input placeholder="请输入用户名" />
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem name="password">
												<Input.Password placeholder="请输入密码" />
											</FormItem>
										</Col>
									</Row>
								</FormItem>
							</Form>
						</FormBlock>
					);
				}
			default:
				break;
		}
	};
	return (
		<ProPage>
			<ProHeader title="添加集群" onBack={() => window.history.back()} />
			<ProContent>
				<Steps current={current}>
					<Step title="选择方式" description="选择添加集群的方式" />
					<Step
						title="选择模式"
						description="选择添加集群采用的模式"
					/>
					<Step title="模式配置" description="输入模式相关配置" />
				</Steps>
				{childrenRender(current)}
				<Space>
					{current === 0 && (
						<Button onClick={() => window.history.back()}>
							取消
						</Button>
					)}
					{current !== 0 && (
						<Button onClick={() => setCurrent(current - 1)}>
							返回上一页
						</Button>
					)}
					{current !== 2 && (
						<Button
							type="primary"
							onClick={() => setCurrent(current + 1)}
						>
							下一步
						</Button>
					)}
					{current === 2 && (
						<Button type="primary" onClick={handleSubmit}>
							完成
						</Button>
					)}
				</Space>
			</ProContent>
		</ProPage>
	);
}
export default connect(() => ({}), {
	setRefreshCluster
})(AddResourcePool);
