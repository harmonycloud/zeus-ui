import React, { useEffect, useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import {
	Form,
	Field,
	Grid,
	Radio,
	Input,
	Select,
	Button,
	Switch,
	Message,
	Icon,
	Tab
} from '@alicloud/console-components';
import FormBlock from '@/components/FormBlock';
import { useParams, useHistory } from 'react-router';
import {
	postCluster,
	getCluster,
	putCluster,
	getJoinCommand
} from '@/services/common';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { clusterAddType } from '@/types';
import { connect } from 'react-redux';
import CustomIcon from '@/components/CustomIcon';
import { apiUrl } from '@/utils/url';
import storage from '@/utils/storage';

// ! 去掉了在表单中安装或者接入组件的操作
const { Option } = Select;
const { Group: RadioGroup } = Radio;
const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};
const formItemLayout2 = {
	labelCol: {
		fixedSpan: 8
	},
	wrapperCol: {
		span: 16
	}
};
const yesOrNo = [
	{ value: 'uninstall', label: '不安装' },
	{ value: 'true', label: '安装' },
	{ value: 'false', label: '接入' }
];
const { Row, Col } = Grid;
export interface valuesProps {
	name: string;
	nickname: string;
	protocol: string;
	host: string;
	port: number;
	cert: string;
	protocolHarbor: string;
	addressHarbor: string;
	portHarbor: number;
	chartRepo: string;
	user: string;
	password: string;
	ingressClassName: string;
	ingressAddress: string;
	namespace: string;
	configMapName: string;
	protocolEs: string;
	hostEs: string;
	portEs: number;
	userEs: string;
	passwordEs: string;
	logCollect: boolean;
	protocolAlert: string;
	hostAlert: string;
	portAlert: string;
	protocolGrafana: string;
	hostGrafana: string;
	portGrafana: string;
	protocolPrometheus: string;
	hostPrometheus: string;
	portPrometheus: string;
	accessKeyId: string;
	bucketName: string;
	minioName: string;
	secretAccessKey: string;
}
interface paramsProps {
	clusterId: string;
}
interface addFormProps {
	setRefreshCluster: (flag: boolean) => void;
}
enum stateEnum {
	error = 'error',
	loading = 'loading',
	success = 'success',
	warning = 'warning'
}
function AddForm(props: addFormProps): JSX.Element {
	const { setRefreshCluster } = props;
	const [dcId, setDcId] = useState<string>('');
	const [quickName, setQuickName] = useState<string>();
	const [command, setCommand] = useState<string>('');
	const [inputState, setInputState] = useState<stateEnum>();
	const field = Field.useField();
	const params: paramsProps = useParams();
	const history = useHistory();
	useEffect(() => {
		if (params.clusterId) {
			getCluster({ clusterId: params.clusterId, visible: true }).then(
				(res) => {
					if (res.success) {
						setDcId(res.data.dcId);
						field.setValues({
							name: res.data.name,
							nickname: res.data.nickname,
							host: res.data.host,
							protocol: res.data.protocol,
							port: res.data.port
						});
						if (res.data.cert) {
							field.setValues({
								cert: res.data.cert.certificate
							});
						}
						if (res.data.registry) {
							field.setValues({
								protocolHarbor: res.data.registry.protocol,
								addressHarbor: res.data.registry.address,
								portHarbor: res.data.registry.port,
								user: res.data.registry.user,
								password: res.data.registry.password,
								chartRepo: res.data.registry.chartRepo
							});
						}
					}
				}
			);
		}
	}, [params.clusterId]);
	const uploadConf = (e: any) => {
		const reader = new window.FileReader();
		reader.onload = function (e) {
			field.setValue('cert', reader.result);
		};
		reader.readAsText(e.target.files[0]);
	};
	const onOk = () => {
		field.validate((errors) => {
			if (errors) return;
			const values: valuesProps = field.getValues();
			const sendData: clusterAddType = {
				cert: {
					certificate: values.cert
				},
				name: values.name,
				nickname: values.nickname,
				host: values.host,
				protocol: values.protocol,
				port: values.port,
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
			if (params.clusterId) {
				sendData.clusterId = params.clusterId;
				sendData.dcId = dcId;
				putCluster(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', {
								data: '资源池修改成功'
							})
						);
						setRefreshCluster(true);
						history.push(
							'/systemManagement/resourcePoolManagement'
						);
					} else {
						Message.show(messageConfig('error', '错误', res));
					}
				});
			} else {
				postCluster(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', {
								data: '资源池接入成功'
							})
						);
						setRefreshCluster(true);
						storage.setLocal(
							'cluster-detail-current-tab',
							'component'
						);
						history.push(
							`/systemManagement/resourcePoolManagement/resourcePoolDetail/default--${sendData.name}/${sendData.nickname}`
						);
					} else {
						Message.show(messageConfig('error', '错误', res));
					}
				});
			}
		});
	};
	const onBlur = () => {
		console.log(quickName);
		// 构建到环境中使用
		if (!quickName || quickName === '') {
			setInputState(stateEnum.error);
			return;
		}
		const apiAddress =
			window.location.protocol.toLowerCase() === 'https:'
				? `https://${window.location.hostname}:${window.location.port}/api`
				: `http://${window.location.hostname}:${window.location.port}/api`;
		const sendData = {
			name: quickName,
			apiAddress: apiAddress
		};
		getJoinCommand(sendData).then((res) => {
			if (res.success) {
				setCommand(res.data);
			} else {
				setCommand('');
				Message.show(messageConfig('error', '失败', res));
			}
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
		// setTimeout(() => {
		// 	// setIconVisible(false);
		// }, 3000);
		Message.show(messageConfig('success', '成功', '复制成功'));
	};
	return (
		<Page>
			<Header
				title={
					params.clusterId
						? '编辑资源池（其他资源池）'
						: '添加资源池（其他资源池）'
				}
				hasBackArrow={true}
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Tab>
					<Tab.Item
						title="快捷模式"
						disabled={params.clusterId ? true : false}
					>
						<FormBlock title="基础信息">
							<FormItem
								style={{ width: '50%', marginLeft: 12 }}
								{...formItemLayout}
								label="英文简称"
								pattern={pattern.name}
								patternMessage="请输入由小写字母数字及“-”组成的2-40个字符"
								required
								requiredMessage="请输入英文简称"
								className="ne-required-ingress"
								labelTextAlign="left"
								asterisk={false}
							>
								<div className="display-flex">
									<Input
										name="name"
										value={quickName}
										trim={true}
										state={inputState}
										placeholder="请输入英文简称"
										onChange={(value: string) => {
											setQuickName(value);
											setInputState(undefined);
										}}
										// onBlur={onBlur}
										style={{
											width: 'calc(100% - 100px)',
											marginRight: 8
										}}
									/>
									<Button type="primary" onClick={onBlur}>
										生成
									</Button>
								</div>
								<p
									style={{
										display:
											inputState === 'error'
												? 'block'
												: 'none',
										color: '#Ef595C'
									}}
								>
									请输入资源池的英文简称
								</p>
							</FormItem>
							<div className="quick-model-content">
								<div className="quick-model-title">
									在已有资源池的任意一个master节点上运行以下指令，实现资源池纳管
								</div>
								<div className="display-flex">
									<div className="quick-model-text">
										{command}
									</div>
									<div
										className="quick-model-copy"
										onClick={copyValue}
									>
										<CustomIcon
											type="icon-fuzhi1"
											style={{
												color: '#FFFFFF',
												marginLeft: 7,
												marginTop: 40,
												cursor: 'pointer'
											}}
											size="xl"
										/>
									</div>
								</div>
							</div>
						</FormBlock>
						<div>
							<Button
								style={{ marginRight: 8 }}
								onClick={() => window.history.back()}
							>
								返回上一页
							</Button>
							<Button
								type="primary"
								onClick={() =>
									history.push(
										'/systemManagement/resourcePoolManagement'
									)
								}
							>
								退出
							</Button>
						</div>
					</Tab.Item>
					<Tab.Item title="表单模式">
						<FormBlock title="基础信息">
							<Form
								{...formItemLayout}
								field={field}
								style={{ width: '50%', paddingLeft: 12 }}
							>
								<FormItem
									label="英文简称"
									pattern={pattern.name}
									patternMessage="请输入由小写字母数字及“-”组成的2-40个字符"
									required
									requiredMessage="请输入英文简称"
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
								>
									<Input
										name="name"
										trim={true}
										disabled={
											params.clusterId ? true : false
										}
										placeholder="请输入英文简称"
									/>
								</FormItem>
								<FormItem
									label="显示名称"
									required
									requiredMessage="请输入显示名称"
									maxLength={80}
									minmaxLengthMessage="请输入名称，且最大长度不超过80个字符"
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
								>
									<Input
										name="nickname"
										trim={true}
										placeholder="请输入显示名称"
									/>
								</FormItem>
								<FormItem
									label="Apiserver地址"
									style={{ marginBottom: 0 }}
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
								>
									<Row gutter={4}>
										<Col span={6}>
											<FormItem>
												<Input
													name="protocol"
													value="https"
													disabled={true}
												/>
											</FormItem>
										</Col>
										<Col span={12}>
											<FormItem
												pattern={pattern.ip}
												patternMessage="请输入正确的ip地址！"
												required
												requiredMessage="请输入地址"
											>
												<Input
													htmlType="text"
													name="host"
													disabled={
														params.clusterId
															? true
															: false
													}
													trim={true}
													placeholder="请输入主机地址"
												/>
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem
												required
												requiredMessage="请输入端口"
											>
												<Input
													htmlType="number"
													name="port"
													disabled={
														params.clusterId
															? true
															: false
													}
													value={6443}
													trim={true}
													placeholder="端口"
												/>
											</FormItem>
										</Col>
									</Row>
								</FormItem>
								<FormItem
									label="AdminConfig"
									required
									requiredMessage="请输入AdminConfig"
									className="ne-required-ingress upload-position"
									labelTextAlign="left"
									asterisk={false}
								>
									<Input.TextArea
										name="cert"
										rows={4}
										placeholder="请输入AdminConfig"
									/>
									<div className="upload-parse-file">
										<Icon
											type="arrow-to-top"
											size="xs"
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
								</FormItem>
								<FormItem
									label="Harbor地址"
									style={{ marginBottom: 0 }}
									labelTextAlign="left"
									asterisk={false}
								>
									<Row>
										<Col span={6}>
											<FormItem>
												<Select
													name="protocolHarbor"
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
												// pattern={pattern.ip}
												// patternMessage="请输入正确的ip地址！"
												// required
												// requiredMessage="请输入地址"
												style={{ marginLeft: -2 }}
											>
												<Input
													htmlType="text"
													name="addressHarbor"
													trim={true}
													placeholder="请输入主机地址"
												/>
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem
												// required
												// requiredMessage="请输入端口"
												style={{ marginLeft: -2 }}
											>
												<Input
													htmlType="number"
													name="portHarbor"
													trim={true}
													placeholder="端口"
												/>
											</FormItem>
										</Col>
									</Row>
								</FormItem>
								<FormItem
									label="Harbor项目"
									labelTextAlign="left"
									asterisk={false}
									// required
									// requiredMessage="请输入Harbor项目"
								>
									<Input
										name="chartRepo"
										trim={true}
										placeholder="请输入Harbor项目"
									/>
								</FormItem>
								<FormItem
									label="Harbor鉴权"
									style={{ marginBottom: 0 }}
									labelTextAlign="left"
									asterisk={false}
								>
									<Row gutter={4}>
										<Col>
											<FormItem
											// required requiredMessage="请输入用户名"
											>
												<Input
													name="user"
													trim={true}
													placeholder="请输入用户名"
												/>
											</FormItem>
										</Col>
										<Col>
											<FormItem
											//  required requiredMessage="请输入密码"
											>
												<Input.Password
													name="password"
													trim={true}
													placeholder="请输入密码"
												/>
											</FormItem>
										</Col>
									</Row>
								</FormItem>
								{/* 1 */}
								{/* <FormItem
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
									label="备份存储"
								>
									<RadioGroup
										dataSource={yesOrNo}
										shape="button"
										defaultValue={true}
										value={isInstallMinio}
										onChange={(value) =>
											setIsInstallMinio(value as string)
										}
									/>
								</FormItem>
								{isInstallMinio === 'false' && (
									<div className="second-form-content">
										<FormItem
											{...formItemLayout2}
											label="Access Key ID"
											required
											labelTextAlign="left"
											asterisk={false}
											className="ne-required-ingress"
										>
											<Input name="accessKeyId" />
										</FormItem>
										<FormItem
											{...formItemLayout2}
											label="Bucket名称"
											required
											labelTextAlign="left"
											asterisk={false}
											className="ne-required-ingress"
										>
											<Input name="bucketName" />
										</FormItem>
										<FormItem
											{...formItemLayout2}
											label="Minio名称"
											required
											labelTextAlign="left"
											asterisk={false}
											className="ne-required-ingress"
										>
											<Input name="minioName" />
										</FormItem>
										<FormItem
											{...formItemLayout2}
											label="Minio地址"
											required
											labelTextAlign="left"
											asterisk={false}
											className="ne-required-ingress"
										>
											<Input.Group
												addonBefore={select}
												addonAfter={input}
											>
												<Input
													style={{ width: '100%' }}
													value={mid}
													onChange={(value) =>
														handleChange(
															value,
															'mid'
														)
													}
												/>
											</Input.Group>
										</FormItem>
										<FormItem
											{...formItemLayout2}
											label="Access Key Secret"
											required
											labelTextAlign="left"
											asterisk={false}
											className="ne-required-ingress"
										>
											<Input name="secretAccessKey" />
										</FormItem>
									</div>
								)} */}
								{/* 2 */}
								{/* <FormItem
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
									label="数据监控"
								>
									<RadioGroup
										dataSource={yesOrNo}
										shape="button"
										defaultValue={true}
										value={isInstallPrometheus}
										onChange={(value) =>
											setIsInstallPrometheus(
												value as string
											)
										}
									/>
								</FormItem>
								{isInstallPrometheus === 'false' && (
									<div
										className="second-form-content"
										style={{ paddingBottom: 0 }}
									>
										<FormItem
											{...formItemLayout}
											className="ne-required-ingress"
											labelTextAlign="left"
											label="prometheus地址"
											style={{ marginBottom: 0 }}
										>
											<Row>
												<Col span={6}>
													<FormItem>
														<Select
															name="protocolPrometheus"
															style={{
																width: '100%'
															}}
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
														required
														requiredMessage="请输入ip地址"
														pattern={pattern.ip}
														patternMessage="请输入正确的ip地址！"
														style={{
															marginLeft: -2
														}}
													>
														<Input
															htmlType="text"
															name="hostPrometheus"
															trim={true}
															placeholder="请输入主机地址"
														/>
													</FormItem>
												</Col>
												<Col span={6}>
													<FormItem
														required
														requiredMessage="请输入端口"
														style={{
															marginLeft: -2
														}}
													>
														<Input
															htmlType="number"
															name="portPrometheus"
															trim={true}
															placeholder="端口"
														/>
													</FormItem>
												</Col>
											</Row>
										</FormItem>
									</div>
								)} */}
								{/* 3 */}
								{/* <FormItem
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
									label="监控告警"
								>
									<RadioGroup
										dataSource={yesOrNo}
										shape="button"
										defaultValue={true}
										value={isInstallAlert}
										onChange={(value) =>
											setIsInstallAlert(value as string)
										}
									/>
								</FormItem>
								{isInstallAlert === 'false' && (
									<div
										className="second-form-content"
										style={{ paddingBottom: 0 }}
									>
										<FormItem
											{...formItemLayout}
											className="ne-required-ingress"
											labelTextAlign="left"
											label="监控告警地址"
											style={{ marginBottom: 0 }}
										>
											<Row>
												<Col span={6}>
													<FormItem>
														<Select
															name="protocolAlert"
															style={{
																width: '100%'
															}}
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
														required
														requiredMessage="请输入ip地址"
														pattern={pattern.ip}
														patternMessage="请输入正确的ip地址！"
														style={{
															marginLeft: -2
														}}
													>
														<Input
															htmlType="text"
															name="hostAlert"
															trim={true}
															placeholder="请输入主机地址"
														/>
													</FormItem>
												</Col>
												<Col span={6}>
													<FormItem
														style={{
															marginLeft: -2
														}}
														required
														requiredMessage="请输入端口"
													>
														<Input
															htmlType="number"
															name="portAlert"
															trim={true}
															placeholder="端口"
														/>
													</FormItem>
												</Col>
											</Row>
										</FormItem>
									</div>
								)} */}
								{/* 4 */}
								{/* <FormItem
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
									label="监控面板"
								>
									<RadioGroup
										dataSource={yesOrNo}
										shape="button"
										defaultValue={true}
										value={isInstallGrafana}
										onChange={(value) =>
											setIsInstallGrafana(value as string)
										}
									/>
								</FormItem>
								{isInstallGrafana === 'false' && (
									<div
										className="second-form-content"
										style={{ paddingBottom: 0 }}
									>
										<FormItem
											{...formItemLayout}
											className="ne-required-ingress"
											labelTextAlign="left"
											label="grafana地址"
											style={{ marginBottom: 0 }}
										>
											<Row>
												<Col span={6}>
													<FormItem>
														<Select
															name="protocolGrafana"
															style={{
																width: '100%'
															}}
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
														required
														requiredMessage="请输入ip地址"
														pattern={pattern.ip}
														patternMessage="请输入正确的ip地址！"
														style={{
															marginLeft: -2
														}}
													>
														<Input
															htmlType="text"
															name="hostGrafana"
															trim={true}
															placeholder="请输入主机地址"
														/>
													</FormItem>
												</Col>
												<Col span={6}>
													<FormItem
														required
														requiredMessage="请输入端口"
														style={{
															marginLeft: -2
														}}
													>
														<Input
															htmlType="number"
															name="portGrafana"
															trim={true}
															placeholder="端口"
														/>
													</FormItem>
												</Col>
											</Row>
										</FormItem>
									</div>
								)} */}
								{/* 5 */}
								{/* <FormItem
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
									label="日志采集"
								>
									<RadioGroup
										dataSource={yesOrNo}
										shape="button"
										defaultValue={true}
										value={isInstallLogging}
										onChange={(value) =>
											setIsInstallLogging(value as string)
										}
									/>
								</FormItem>
								{isInstallLogging === 'false' && (
									<div className="second-form-content">
										<FormItem
											{...formItemLayout}
											className="ne-required-ingress"
											labelTextAlign="left"
											asterisk={false}
											label="ES地址"
											style={{ marginBottom: 0 }}
										>
											<Row>
												<Col span={6}>
													<FormItem>
														<Select
															name="protocolEs"
															style={{
																width: '100%'
															}}
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
														required
														requiredMessage="请输入ip地址"
														pattern={pattern.ip}
														patternMessage="请输入正确的ip地址！"
														style={{
															marginLeft: -2
														}}
													>
														<Input
															htmlType="text"
															name="hostEs"
															trim={true}
															placeholder="请输入主机地址"
														/>
													</FormItem>
												</Col>
												<Col span={6}>
													<FormItem
														required
														requiredMessage="请输入端口"
														style={{
															marginLeft: -2
														}}
													>
														<Input
															htmlType="number"
															name="portEs"
															trim={true}
															placeholder="端口"
														/>
													</FormItem>
												</Col>
											</Row>
										</FormItem>
										<FormItem
											{...formItemLayout}
											className="ne-required-ingress"
											labelTextAlign="left"
											asterisk={false}
											label="ES鉴权"
											style={{ marginBottom: 0 }}
										>
											<Row gutter={4}>
												<Col>
													<FormItem>
														<Input
															name="userEs"
															trim={true}
															placeholder="请输入用户名"
														/>
													</FormItem>
												</Col>
												<Col>
													<FormItem>
														<Input.Password
															name="passwordEs"
															trim={true}
															placeholder="请输入密码"
														/>
													</FormItem>
												</Col>
											</Row>
										</FormItem>
										<FormItem
											{...formItemLayout}
											className="ne-required-ingress"
											labelTextAlign="left"
											asterisk={false}
											label="ES日志采集工具"
											style={{ marginBottom: 0 }}
										>
											<Switch
												name="logCollect"
												checked={logCollect}
												onChange={(value) =>
													setLogCollect(value)
												}
											/>
										</FormItem>
									</div>
								)} */}
								{/* 6 */}
								{/* <FormItem
									className="ne-required-ingress"
									labelTextAlign="left"
									asterisk={false}
									label="负载均衡"
								>
									<RadioGroup
										dataSource={yesOrNo}
										shape="button"
										defaultValue={true}
										value={isInstallIngress}
										onChange={(value) =>
											setIsInstallIngress(value as string)
										}
									/>
								</FormItem>
								{isInstallIngress === 'false' && (
									<div className="second-form-content">
										<FormItem
											{...formItemLayout}
											label="Ingress名称"
											required
											requiredMessage="请输入Ingress名称"
											className="ne-required-ingress"
											labelTextAlign="left"
											asterisk={false}
										>
											<Input
												htmlType="text"
												name="ingressClassName"
												trim={true}
												defaultValue="nginx-ingress-controller"
												placeholder="请输入Ingress名称"
											/>
										</FormItem>
										<FormItem
											{...formItemLayout}
											label="Ingress地址"
											required
											requiredMessage="请输入Ingress地址"
											className="ne-required-ingress"
											labelTextAlign="left"
											asterisk={false}
										>
											<Input
												htmlType="text"
												name="ingressAddress"
												trim={true}
												placeholder="请输入主机地址"
											/>
										</FormItem>
										<FormItem
											{...formItemLayout}
											label="ConfigMap分区"
											required
											requiredMessage="请输入分区"
											className="ne-required-ingress"
											labelTextAlign="left"
											asterisk={false}
										>
											<Input
												htmlType="text"
												name="namespace"
												trim={true}
												placeholder="请输入分区"
											/>
										</FormItem>
										<FormItem
											{...formItemLayout}
											label="ConfigMap名称"
											required
											requiredMessage="请输入ConfigMap名称"
											className="ne-required-ingress"
											labelTextAlign="left"
											asterisk={false}
										>
											<Input
												htmlType="text"
												name="configMapName"
												trim={true}
												placeholder="请输入ConfigMap名称"
											/>
										</FormItem>
									</div>
								)} */}
							</Form>
						</FormBlock>
						<div>
							<Button
								type="primary"
								onClick={onOk}
								style={{ marginRight: 8 }}
							>
								完成
							</Button>
							<Button onClick={() => window.history.back()}>
								取消
							</Button>
						</div>
					</Tab.Item>
				</Tab>
			</Content>
		</Page>
	);
}
export default connect(() => ({}), {
	setRefreshCluster
})(AddForm);
