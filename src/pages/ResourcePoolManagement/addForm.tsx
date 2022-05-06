import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import {
	Form,
	Row,
	Col,
	Input,
	Select,
	Button,
	notification,
	Tabs
} from 'antd';
import { connect } from 'react-redux';
import { IconFont } from '@/components/IconFont';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import FormBlock from '@/components/FormBlock';
import {
	postCluster,
	getCluster,
	putCluster,
	getJoinCommand
} from '@/services/common';
import pattern from '@/utils/pattern';
import { setRefreshCluster } from '@/redux/globalVar/var';
import { clusterAddType } from '@/types';
import storage from '@/utils/storage';
import { VerticalAlignTopOutlined } from '@ant-design/icons';

const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 19
	}
};
const { TabPane } = Tabs;
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
	const params: paramsProps = useParams();
	const [dcId, setDcId] = useState<string>('');
	const [quickName, setQuickName] = useState<string>();
	const [command, setCommand] = useState<string>('');
	const [inputState, setInputState] = useState<stateEnum>();
	const [tabKey, setTabKey] = useState<string>(
		params.clusterId ? 'form' : 'quick'
	);
	const [form] = Form.useForm();

	const history = useHistory();
	useEffect(() => {
		if (params.clusterId) {
			getCluster({ clusterId: params.clusterId, visible: true }).then(
				(res) => {
					if (res.success) {
						setDcId(res.data.dcId);
						form.setFieldsValue({
							name: res.data.name,
							nickname: res.data.nickname,
							host: res.data.host,
							protocol: res.data.protocol,
							port: res.data.port
						});
						if (res.data.cert) {
							form.setFieldsValue({
								cert: res.data.cert.certificate
							});
						}
						if (res.data.registry) {
							form.setFieldsValue({
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
			form.setFieldsValue({
				cert: reader.result
			});
			// field.setValue('cert', reader.result);
		};
		reader.readAsText(e.target.files[0]);
	};
	const onOk = () => {
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
						notification.success({
							message: '成功',
							description: '集群修改成功'
						});
						setRefreshCluster(true);
						history.push(
							'/systemManagement/resourcePoolManagement'
						);
					} else {
						notification.error({
							message: '错误',
							description: res.errorMsg
						});
					}
				});
			} else {
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
			}
		});
	};
	const onBlur = () => {
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
				notification.error({
					message: '错误',
					description: res.errorMsg
				});
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
		notification.success({
			message: '错误',
			description: '复制成功'
		});
	};
	return (
		<ProPage>
			<ProHeader
				title={
					params.clusterId
						? '编辑集群（其他集群）'
						: '添加集群（其他集群）'
				}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<Tabs
					activeKey={tabKey}
					defaultActiveKey="quick"
					onChange={(key: string) => setTabKey(key)}
				>
					<TabPane
						tab="快捷模式"
						key="quick"
						disabled={params.clusterId ? true : false}
					>
						<FormBlock title="基础信息">
							<FormItem
								style={{ width: '50%', marginLeft: 12 }}
								{...formItemLayout}
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
								required
								labelAlign="left"
							>
								<div className="display-flex">
									<Input
										name="name"
										value={quickName}
										// state={inputState}
										placeholder="请输入集群名称生成集群纳管脚本"
										onChange={(e) => {
											setQuickName(e.target.value);
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
									请输入集群的英文简称
								</p>
							</FormItem>
							<div className="quick-model-content">
								<div className="quick-model-title">
									在已有集群的任意一个master节点上运行以下指令，实现集群纳管
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
					</TabPane>
					<TabPane tab="表单模式" key="form">
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
									<Input
										disabled={
											params.clusterId ? true : false
										}
										placeholder="请输入英文简称"
									/>
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
								>
									<Row gutter={4}>
										<Col span={6}>
											<FormItem name="protocol">
												<Input
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
											>
												<Input
													disabled={
														params.clusterId
															? true
															: false
													}
													placeholder="请输入主机地址"
												/>
											</FormItem>
										</Col>
										<Col span={6}>
											<FormItem
												required
												name="port"
												rules={[
													{
														required: true,
														message: '请输入端口'
													}
												]}
											>
												<Input
													type="number"
													disabled={
														params.clusterId
															? true
															: false
													}
													defaultValue={6443}
													placeholder="端口"
												/>
											</FormItem>
										</Col>
									</Row>
								</FormItem>
								<FormItem
									label="AdminConfig"
									required
									name="cert"
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
									<div className="upload-parse-file">
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
								</FormItem>
								<FormItem
									label="Harbor地址"
									style={{ marginBottom: 0 }}
								>
									<Row>
										<Col span={6}>
											<FormItem name="protocolHarbor">
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
												<Input
													type="number"
													placeholder="端口"
												/>
											</FormItem>
										</Col>
									</Row>
								</FormItem>
								<FormItem label="Harbor项目" name="chartRepo">
									<Input placeholder="请输入Harbor项目" />
								</FormItem>
								<FormItem
									label="Harbor鉴权"
									style={{ marginBottom: 0 }}
								>
									<Row gutter={4}>
										<Col>
											<FormItem name="user">
												<Input placeholder="请输入用户名" />
											</FormItem>
										</Col>
										<Col>
											<FormItem name="password">
												<Input.Password placeholder="请输入密码" />
											</FormItem>
										</Col>
									</Row>
								</FormItem>
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
					</TabPane>
				</Tabs>
			</ProContent>
		</ProPage>
	);
}
export default connect(() => ({}), {
	setRefreshCluster
})(AddForm);
