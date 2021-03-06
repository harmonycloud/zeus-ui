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
	InputNumber
} from 'antd';
import { connect } from 'react-redux';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import FormBlock from '@/components/FormBlock';
import { postCluster, getCluster, putCluster } from '@/services/common';
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
function AddForm(props: addFormProps): JSX.Element {
	const { setRefreshCluster } = props;
	const params: paramsProps = useParams();
	const [dcId, setDcId] = useState<string>('');
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
							console.log(res.data.cert);
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
							message: '??????',
							description: '??????????????????'
						});
						setRefreshCluster(true);
						history.push(
							'/systemManagement/resourcePoolManagement'
						);
					} else {
						notification.error({
							message: '??????',
							description: res.errorMsg
						});
					}
				});
			} else {
				postCluster(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '??????',
							description: '??????????????????'
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
							message: '??????',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};

	return (
		<ProPage>
			<ProHeader
				title={
					params.clusterId
						? '??????????????????????????????'
						: '??????????????????????????????'
				}
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<FormBlock title="????????????">
					<Form
						{...formItemLayout}
						form={form}
						labelAlign="left"
						style={{ width: '50%', paddingLeft: 12 }}
					>
						<FormItem
							label="????????????"
							required
							rules={[
								{
									required: true,
									message: '?????????????????????'
								},
								{
									pattern: new RegExp(pattern.name),
									message:
										'????????????????????????????????????-????????????2-40?????????'
								}
							]}
							name="name"
						>
							<Input
								disabled={params.clusterId ? true : false}
								placeholder="?????????????????????"
							/>
						</FormItem>
						<FormItem
							label="????????????"
							required
							rules={[
								{
									required: true,
									message: '?????????????????????'
								},
								{
									max: 80,
									message:
										'??????????????????????????????????????????80?????????'
								}
							]}
							name="nickname"
						>
							<Input placeholder="?????????????????????" />
						</FormItem>
						<FormItem
							label="Apiserver??????"
							style={{ marginBottom: 0 }}
							name="apiserver"
							required
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
												message: '???????????????'
											},
											{
												pattern: new RegExp(pattern.ip),
												message: '??????????????????ip?????????'
											}
										]}
										style={{ marginLeft: -2 }}
									>
										<Input
											style={{
												width: '100%'
											}}
											disabled={
												params.clusterId ? true : false
											}
											placeholder="?????????????????????"
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
												message: '???????????????'
											}
										]}
										initialValue={6443}
									>
										<InputNumber
											style={{ width: '100%' }}
											disabled={
												params.clusterId ? true : false
											}
											placeholder="??????"
										/>
									</FormItem>
								</Col>
							</Row>
						</FormItem>
						<FormItem
							label="AdminConfig"
							required
							style={{ marginBottom: 0 }}
						>
							<FormItem
								name="cert"
								required
								rules={[
									{
										required: true,
										message: '?????????AdminConfig'
									}
								]}
							>
								<Input.TextArea
									rows={4}
									placeholder="?????????AdminConfig"
								/>
							</FormItem>
							<Form.Item className="upload-parse-file">
								<div>
									<VerticalAlignTopOutlined
										style={{ marginRight: 4 }}
									/>
									????????????
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
							label="??????????????????"
							style={{ marginBottom: 0 }}
							name="harborAddress"
						>
							<Row>
								<Col span={6}>
									<FormItem name="protocolHarbor">
										<Select style={{ width: '100%' }}>
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
											placeholder="?????????????????????"
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
											placeholder="??????"
										/>
									</FormItem>
								</Col>
							</Row>
						</FormItem>
						<FormItem label="??????????????????" name="chartRepo">
							<Input placeholder="???????????????????????????" />
						</FormItem>
						<FormItem
							label="??????????????????"
							style={{ marginBottom: 0 }}
							name="harborAuth"
						>
							<Row gutter={4}>
								<Col span={12}>
									<FormItem name="user">
										<Input placeholder="??????????????????" />
									</FormItem>
								</Col>
								<Col span={12}>
									<FormItem name="password">
										<Input.Password placeholder="???????????????" />
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
						??????
					</Button>
					<Button onClick={() => window.history.back()}>??????</Button>
				</div>
			</ProContent>
		</ProPage>
	);
}
export default connect(() => ({}), {
	setRefreshCluster
})(AddForm);
