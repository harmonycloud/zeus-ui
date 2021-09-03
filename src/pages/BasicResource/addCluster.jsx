import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	Dialog,
	Form,
	Field,
	Input,
	Grid,
	Select,
	Switch,
	Radio,
	Message
} from '@alicloud/console-components';
import { postCluster, getCluster, putCluster } from '@/services/common.js';
import pattern from '@/utils/pattern';
import messageConfig from '@/components/messageConfig';
import { setRefreshCluster } from '@/redux/globalVar/var';

const { Group: RadioGroup } = Radio;
const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		span: 5
	},
	wrapperCol: {
		span: 17
	}
};
const formItemParam = {
	labelTextAlign: 'left',
	asterisk: false,
	className: 'ne-required-ingress'
};
const formItemParamNoRequired = {
	labelTextAlign: 'left',
	asterisk: false
};
const { Row, Col } = Grid;

const AddCluster = (props) => {
	const { visible, clusterId, cancelHandle, updateFn, setRefreshCluster } =
		props;
	const field = Field.useField();
	const [dcId, setDcId] = useState('');
	// const [tcpFlag, setTcpFlag] = useState(true);
	const [isInstallIngress, setIsInstallIngress] = useState(true);
	const [isInstallLogging, setIsInstallLogging] = useState(true);
	const [logCollect, setLogCollect] = useState(true);
	const [isInstallAlert, setIsInstallAlert] = useState(true);
	const [isInstallGrafana, setIsInstallGrafana] = useState(true);
	const [isInstallPrometheus, setIsInstallPrometheus] = useState(true);

	const okHandle = () => {
		field.validate((err, data) => {
			if (!err) {
				let sendData = {
					cert: {
						certificate: data.cert
					},
					name: data.name,
					nickname: data.nickname,
					host: data.host,
					protocol: data.protocol,
					port: data.port,
					registry: {
						protocol: data.protocolHarbor,
						address: data.addressHarbor,
						port: data.portHarbor,
						user: data.user,
						password: data.password,
						type: 'harbor',
						chartRepo: data.chartRepo
					}
				};
				// if (tcpFlag) {
				// 	sendData.ingress.tcp = {
				// 		enabled: true,
				// 		namespace: data.namespace,
				// 		configMapName: data.configMapName
				// 	};
				// } else {
				// 	sendData.ingress.tcp = {
				// 		enabled: false
				// 	};
				// }
				if (!isInstallIngress) {
					sendData.ingress = {
						address: data.ingressAddress,
						ingressClassName: data.ingressClassName,
						tcp: {
							enabled: true,
							namespace: data.namespace,
							configMapName: data.configMapName
						}
					};
				}
				if (!isInstallLogging) {
					sendData.logging = {
						elasticSearch: {
							protocol: data.protocolEs,
							host: data.hostEs,
							port: data.portEs,
							user: data.userEs,
							password: data.passwordEs,
							logCollect: data.logCollect
						}
					};
				}
				if (!isInstallAlert) {
					sendData.monitor = {
						...sendData.monitor,
						alertManager: {
							host: data.hostAlert,
							port: data.portAlert,
							protocol: data.protocolAlert
						}
					};
				}
				if (!isInstallGrafana) {
					sendData.monitor = {
						...sendData.monitor,
						grafana: {
							host: data.hostGrafana,
							port: data.portGrafana,
							protocol: data.protocolGrafana
						}
					};
				}
				if (!isInstallPrometheus) {
					sendData.monitor = {
						...sendData.monitor,
						prometheus: {
							host: data.hostPrometheus,
							port: data.portPrometheus,
							protocol: data.protocolPrometheus
						}
					};
				}
				// console.log(sendData);
				if (clusterId) {
					sendData.clusterId = clusterId;
					sendData.dcId = dcId;
					putCluster(sendData).then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', {
									data: '集群修改成功'
								})
							);
							updateFn();
							cancelHandle();
							setRefreshCluster(true);
						} else {
							Message.show(messageConfig('error', '错误', res));
						}
					});
				} else {
					postCluster(sendData).then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', {
									data: '集群接入成功'
								})
							);
							updateFn();
							cancelHandle();
							setRefreshCluster(true);
						} else {
							Message.show(messageConfig('error', '错误', res));
						}
					});
				}
			}
		});
	};

	useEffect(() => {
		if (clusterId) {
			getCluster({ clusterId, visible: true }).then((res) => {
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
					if (res.data.ingress) {
						setIsInstallIngress(false);
						field.setValues({
							ingressAddress: res.data.ingress.address,
							ingressClassName: res.data.ingress.ingressClassName,
							namespace: res.data.ingress.tcp.namespace,
							configMapName: res.data.ingress.tcp.configMapName
						});
					}
					if (res.data.logging && res.data.logging.elasticSearch) {
						setIsInstallLogging(false);
						field.setValues({
							protocolEs: res.data.logging.elasticSearch.protocol,
							hostEs: res.data.logging.elasticSearch.host,
							portEs: res.data.logging.elasticSearch.port,
							userEs: res.data.logging.elasticSearch.user,
							passwordEs: res.data.logging.elasticSearch.password,
							logCollect:
								res.data.logging.elasticSearch.logCollect
						});
					}
					if (res.data.monitor?.alertManager) {
						setIsInstallAlert(false);
						field.setValues({
							protocolAlert:
								res.data.monitor.alertManager.protocol,
							hostAlert: res.data.monitor.alertManager.host,
							portAlert: res.data.monitor.alertManager.port
						});
					}
					if (res.data.monitor?.grafana) {
						setIsInstallGrafana(false);
						field.setValues({
							protocolGrafana: res.data.monitor.grafana.protocol,
							hostGrafana: res.data.monitor.grafana.host,
							portGrafana: res.data.monitor.grafana.port
						});
					}
					if (res.data.monitor?.prometheus) {
						setIsInstallPrometheus(false);
						field.setValues({
							protocolPrometheus:
								res.data.monitor.prometheus.protocol,
							hostPrometheus: res.data.monitor.prometheus.host,
							portPrometheus: res.data.monitor.prometheus.port
						});
					}
				}
			});
		}
	}, [clusterId]);

	useEffect(() => {
		field.setValues({
			protocolEs: 'http',
			protocolAlert: 'http',
			protocolGrafana: 'http',
			protocolPrometheus: 'http'
		});
	}, []);

	return (
		<Dialog
			title={clusterId ? '编辑集群' : '添加集群'}
			visible={visible}
			style={{ width: 640 }}
			footerAlign="right"
			onOk={okHandle}
			onCancel={cancelHandle}
			onClose={cancelHandle}
		>
			<Form {...formItemLayout} field={field} style={{ paddingLeft: 12 }}>
				<FormItem
					{...formItemParam}
					label="英文简称"
					pattern={pattern.name}
					patternMessage="请输入由小写字母数字及“-”组成的2-40个字符"
					required
					requiredMessage="请输入英文简称"
				>
					<Input
						name="name"
						trim={true}
						disabled={clusterId ? true : false}
						placeholder="请输入英文简称"
					/>
				</FormItem>
				<FormItem
					{...formItemParam}
					label="显示名称"
					required
					requiredMessage="请输入显示名称"
					maxLength={80}
					minmaxLengthMessage="请输入名称，且最大长度不超过80个字符"
				>
					<Input
						name="nickname"
						trim={true}
						placeholder="请输入显示名称"
					/>
				</FormItem>
				<FormItem
					{...formItemParam}
					label="Apiserver地址"
					style={{ marginBottom: 0 }}
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
									disabled={clusterId ? true : false}
									trim={true}
									placeholder="请输入主机地址"
								/>
							</FormItem>
						</Col>
						<Col span={6}>
							<FormItem required requiredMessage="请输入端口">
								<Input
									htmlType="number"
									name="port"
									disabled={clusterId ? true : false}
									value={6443}
									trim={true}
									placeholder="端口"
								/>
							</FormItem>
						</Col>
					</Row>
				</FormItem>
				<FormItem
					{...formItemParam}
					label="AdminConfig"
					required
					requiredMessage="请输入AdminConfig"
				>
					<Input.TextArea
						name="cert"
						rows={4}
						placeholder="请输入AdminConfig"
					/>
				</FormItem>
				<FormItem
					{...formItemParamNoRequired}
					label="Harbor地址"
					style={{ marginBottom: 0 }}
				>
					<Row>
						<Col span={6}>
							<FormItem>
								<Select name="protocolHarbor">
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
					{...formItemParamNoRequired}
					label="Harbor项目"
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
					{...formItemParamNoRequired}
					label="Harbor鉴权"
					style={{ marginBottom: 0 }}
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
				<FormItem {...formItemParam} label="ingress">
					<RadioGroup
						dataSource={[
							{ value: true, label: '安装' },
							{ value: false, label: '不安装' }
						]}
						defaultValue={true}
						value={isInstallIngress}
						onChange={(value) => setIsInstallIngress(value)}
					/>
				</FormItem>
				{!isInstallIngress && (
					<>
						<FormItem
							{...formItemParam}
							label="Ingress名称"
							required
							requiredMessage="请输入Ingress名称"
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
							{...formItemParam}
							label="Ingress地址"
							required
							requiredMessage="请输入Ingress地址"
						>
							<Input
								htmlType="text"
								name="ingressAddress"
								trim={true}
								placeholder="请输入主机地址"
							/>
						</FormItem>
						<FormItem
							{...formItemParam}
							label="ConfigMap分区"
							required
							requiredMessage="请输入分区"
						>
							<Input
								htmlType="text"
								name="namespace"
								trim={true}
								placeholder="请输入分区"
							/>
						</FormItem>
						<FormItem
							{...formItemParam}
							label="ConfigMap名称"
							required
							requiredMessage="请输入ConfigMap名称"
						>
							<Input
								htmlType="text"
								name="configMapName"
								trim={true}
								placeholder="请输入ConfigMap名称"
							/>
						</FormItem>
					</>
				)}
				{/* <FormItem {...formItemParam} label="Ingress Tcp">
					<Switch
						name="tcpFlag"
						checked={tcpFlag}
						onChange={(value) => setTcpFlag(value)}
					/>
				</FormItem> */}
				<FormItem {...formItemParam} label="logging">
					<RadioGroup
						dataSource={[
							{ value: true, label: '安装' },
							{ value: false, label: '不安装' }
						]}
						defaultValue={true}
						value={isInstallLogging}
						onChange={(value) => setIsInstallLogging(value)}
					/>
				</FormItem>
				{!isInstallLogging && (
					<>
						<FormItem
							{...formItemParam}
							label="ES地址"
							style={{ marginBottom: 0 }}
						>
							<Row>
								<Col span={6}>
									<FormItem>
										<Select name="protocolEs">
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
										pattern={pattern.ip}
										patternMessage="请输入正确的ip地址！"
										style={{ marginLeft: -2 }}
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
									<FormItem style={{ marginLeft: -2 }}>
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
							{...formItemParam}
							// className="formItemParam"
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
							{...formItemParam}
							label="ES日志采集工具"
							style={{ marginBottom: 0 }}
						>
							<Switch
								name="logCollect"
								checked={logCollect}
								onChange={(value) => setLogCollect(value)}
							/>
						</FormItem>
					</>
				)}
				<FormItem {...formItemParam} label="监控告警">
					<RadioGroup
						dataSource={[
							{ value: true, label: '安装' },
							{ value: false, label: '不安装' }
						]}
						defaultValue={true}
						value={isInstallAlert}
						onChange={(value) => setIsInstallAlert(value)}
					/>
				</FormItem>
				{!isInstallAlert && (
					<FormItem
						{...formItemParam}
						// className="formItemParam"
						label="监控告警地址"
						style={{ marginBottom: 0 }}
					>
						<Row>
							<Col span={6}>
								<FormItem>
									<Select name="protocolAlert">
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
									pattern={pattern.ip}
									patternMessage="请输入正确的ip地址！"
									style={{ marginLeft: -2 }}
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
								<FormItem style={{ marginLeft: -2 }}>
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
				)}
				<FormItem {...formItemParam} label="grafana">
					<RadioGroup
						dataSource={[
							{ value: true, label: '安装' },
							{ value: false, label: '不安装' }
						]}
						defaultValue={true}
						value={isInstallGrafana}
						onChange={(value) => setIsInstallGrafana(value)}
					/>
				</FormItem>
				{!isInstallGrafana && (
					<FormItem
						{...formItemParam}
						// className="formItemParam"
						label="grafana地址"
						style={{ marginBottom: 0 }}
					>
						<Row>
							<Col span={6}>
								<FormItem>
									<Select name="protocolGrafana">
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
									pattern={pattern.ip}
									patternMessage="请输入正确的ip地址！"
									style={{ marginLeft: -2 }}
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
								<FormItem style={{ marginLeft: -2 }}>
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
				)}
				<FormItem {...formItemParam} label="prometheus">
					<RadioGroup
						dataSource={[
							{ value: true, label: '安装' },
							{ value: false, label: '不安装' }
						]}
						defaultValue={true}
						value={isInstallPrometheus}
						onChange={(value) => setIsInstallPrometheus(value)}
					/>
				</FormItem>
				{!isInstallPrometheus && (
					<FormItem
						{...formItemParam}
						// className="formItemParam"
						label="prometheus地址"
						style={{ marginBottom: 0 }}
					>
						<Row>
							<Col span={6}>
								<FormItem>
									<Select name="protocolPrometheus">
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
									pattern={pattern.ip}
									patternMessage="请输入正确的ip地址！"
									style={{ marginLeft: -2 }}
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
								<FormItem style={{ marginLeft: -2 }}>
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
				)}
			</Form>
		</Dialog>
	);
};

export default connect(() => ({}), { setRefreshCluster })(AddCluster);
