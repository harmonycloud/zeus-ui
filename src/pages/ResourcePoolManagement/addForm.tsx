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
	Message
} from '@alicloud/console-components';
import FormBlock from '../ServiceCatalog/components/FormBlock';
import { postCluster, getCluster, putCluster } from '@/services/common.js';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { setRefreshCluster } from '@/redux/globalVar/var';

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
const yesOrNo = [
	{ value: 'true', label: '安装' },
	{ value: 'false', label: '不安装' }
];
const { Row, Col } = Grid;
export default function AddForm(): JSX.Element {
	const [isInstallIngress, setIsInstallIngress] = useState<string>('true');
	const [isInstallLogging, setIsInstallLogging] = useState<string>('true');
	const [logCollect, setLogCollect] = useState<boolean>(true);
	const [isInstallAlert, setIsInstallAlert] = useState<string>('true');
	const [isInstallGrafana, setIsInstallGrafana] = useState<string>('true');
	const [isInstallPrometheus, setIsInstallPrometheus] =
		useState<string>('true');
	const field = Field.useField();
	useEffect(() => {
		field.setValues({
			protocolEs: 'http',
			protocolAlert: 'http',
			protocolGrafana: 'https',
			protocolPrometheus: 'http'
		});
	}, []);
	const onOk = () => {
		// field.validate((errors, values) => {
		// 	if (errors) return;
		// });
		const values = field.getValues();
		console.log(values);
		const sendData = {
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
		console.log(sendData);
		// if (clusterId) {
		// 	sendData.clusterId = clusterId;
		// 	sendData.dcId = dcId;
		// 	putCluster(sendData).then((res) => {
		// 		if (res.success) {
		// 			Message.show(
		// 				messageConfig('success', '成功', {
		// 					data: '资源池修改成功'
		// 				})
		// 			);
		// 			updateFn();
		// 			cancelHandle();
		// 			setRefreshCluster(true);
		// 		} else {
		// 			Message.show(messageConfig('error', '错误', res));
		// 		}
		// 	});
		// } else {
		// 	postCluster(sendData).then((res) => {
		// 		if (res.success) {
		// 			Message.show(
		// 				messageConfig('success', '成功', {
		// 					data: '资源池接入成功'
		// 				})
		// 			);
		// 			updateFn();
		// 			cancelHandle();
		// 			setRefreshCluster(true);
		// 		} else {
		// 			Message.show(messageConfig('error', '错误', res));
		// 		}
		// 	});
		// }
	};
	return (
		<Page>
			<Header
				title="添加资源池（其他资源池）"
				hasBackArrow={true}
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
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
								// disabled={clusterId ? true : false}
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
											// disabled={clusterId ? true : false}
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
											// disabled={clusterId ? true : false}
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
							className="ne-required-ingress"
							labelTextAlign="left"
							asterisk={false}
						>
							<Input.TextArea
								name="cert"
								rows={4}
								placeholder="请输入AdminConfig"
							/>
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
						<FormItem
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
						)}
						<FormItem
							className="ne-required-ingress"
							labelTextAlign="left"
							asterisk={false}
							label="ES组件"
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
											<FormItem
												style={{ marginLeft: -2 }}
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
						)}
						<FormItem
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
											<FormItem
												style={{ marginLeft: -2 }}
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
						)}
						<FormItem
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
											<FormItem
												style={{ marginLeft: -2 }}
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
						)}
						<FormItem
							className="ne-required-ingress"
							labelTextAlign="left"
							asterisk={false}
							label="监控中心"
						>
							<RadioGroup
								dataSource={yesOrNo}
								shape="button"
								defaultValue={true}
								value={isInstallPrometheus}
								onChange={(value) =>
									setIsInstallPrometheus(value as string)
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
											<FormItem
												style={{ marginLeft: -2 }}
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
						)}
					</Form>
				</FormBlock>
				<div>
					<Button type="primary" onClick={onOk}>
						完成
					</Button>
					<Button onClick={() => window.history.back()}>取消</Button>
				</div>
			</Content>
		</Page>
	);
}
