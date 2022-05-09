import React, { useEffect } from 'react';
import { Modal, Form, notification } from 'antd';
import { putComponent, cutInComponent, getCluster } from '@/services/common';
import {
	PrometheusRender,
	IngressRender,
	LoggingRender,
	GrafanaRender,
	AlertRender,
	MinioRender,
	LvmRender,
	LocalPathRender
} from './componenstsForm';
import './index.scss';

interface AccessFormProps {
	visible: boolean;
	onCancel: () => void;
	title: string;
	clusterId: string;
	onRefresh: () => void;
	setRefreshCluster: (flag: boolean) => void;
	status: number;
}

const AccessForm = (props: AccessFormProps) => {
	const {
		visible,
		onCancel,
		title,
		clusterId,
		onRefresh,
		setRefreshCluster,
		status
	} = props;
	const [form] = Form.useForm();
	useEffect(() => {
		getCluster({ clusterId: clusterId, detail: true }).then((res) => {
			if (res.success) {
				const cluster = res.data;
				if (cluster.ingress) {
					form.setFieldsValue({
						ingressAddress: cluster.ingress.address,
						ingressClassName: cluster.ingress.ingressClassName,
						namespace: cluster.ingress.tcp.namespace,
						configMapName: cluster.ingress.tcp.configMapName
					});
				}
				if (cluster.logging && cluster.logging.elasticSearch) {
					form.setFieldsValue({
						protocolEs: cluster.logging.elasticSearch.protocol,
						hostEs: cluster.logging.elasticSearch.host,
						portEs: cluster.logging.elasticSearch.port,
						userEs: cluster.logging.elasticSearch.user,
						passwordEs: cluster.logging.elasticSearch.password,
						logCollect: cluster.logging.elasticSearch.logCollect
					});
				}
				if (cluster.monitor?.alertManager) {
					form.setFieldsValue({
						protocolAlert: cluster.monitor.alertManager.protocol,
						hostAlert: cluster.monitor.alertManager.host,
						portAlert: cluster.monitor.alertManager.port
					});
				}
				if (cluster.monitor?.grafana) {
					form.setFieldsValue({
						protocolGrafana: cluster.monitor.grafana.protocol,
						hostGrafana: cluster.monitor.grafana.host,
						portGrafana: cluster.monitor.grafana.port
					});
				}
				if (cluster.monitor?.prometheus) {
					form.setFieldsValue({
						protocolPrometheus: cluster.monitor.prometheus.protocol,
						hostPrometheus: cluster.monitor.prometheus.host,
						portPrometheus: cluster.monitor.prometheus.port
					});
				}
				if (cluster?.storage?.backup?.storage) {
					form.setFieldsValue({
						accessKeyId:
							cluster?.storage?.backup?.storage.accessKeyId,
						bucketName:
							cluster?.storage?.backup?.storage.bucketName,
						minioName: cluster?.storage?.backup?.storage.name,
						secretAccessKey:
							cluster?.storage?.backup?.storage.secretAccessKey,
						endpoint: cluster?.storage?.backup?.storage.endpoint
					});
				}
				if (cluster?.storage?.support) {
					if (
						cluster?.storage?.support.find(
							(item: any) => item.type === 'lvm'
						)
					) {
						form.setFieldsValue({
							lvmName: cluster?.storage?.support.find(
								(item: any) => item.type === 'lvm'
							).name,
							lvmNamespace: cluster?.storage?.support.find(
								(item: any) => item.type === 'lvm'
							).namespace
						});
					}
					if (
						cluster?.storage?.support.find(
							(item: any) => item.type === 'local-path'
						)
					) {
						form.setFieldsValue({
							localPathName: cluster?.storage?.support.find(
								(item: any) => item.type === 'local-path'
							).name,
							localPathNamespace: cluster?.storage?.support.find(
								(item: any) => item.type === 'local-path'
							).namespace
						});
					}
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData: any = {
				clusterId,
				componentName: title
			};
			if (title === 'grafana') {
				sendData.monitor = {
					grafana: {
						host: values.hostGrafana,
						port: values.portGrafana,
						protocol: values.protocolGrafana
					}
				};
			} else if (title === 'minio') {
				sendData.storage = {
					backup: {
						storage: {
							accessKeyId: values.accessKeyId,
							secretAccessKey: values.secretAccessKey,
							bucketName: values.bucketName,
							endpoint: values.endpoint,
							name: values.minioName
						}
					}
				};
			} else if (title === 'ingress') {
				sendData.ingress = {
					address: values.ingressAddress,
					ingressClassName: values.ingressClassName,
					tcp: {
						enabled: true,
						namespace: values.namespace,
						configMapName: values.configMapName
					}
				};
			} else if (title === 'logging') {
				sendData.logging = {
					elasticSearch: {
						protocol: values.protocolEs,
						host: values.hostEs,
						port: values.portEs,
						user: values.userEs,
						password: values.passwordEs,
						logCollect: values.logCollect
					}
				};
			} else if (title === 'alertmanager') {
				sendData.monitor = {
					alertManager: {
						host: values.hostAlert,
						port: values.portAlert,
						protocol: values.protocolAlert
					}
				};
			} else if (title === 'prometheus') {
				sendData.monitor = {
					prometheus: {
						host: values.hostPrometheus,
						port: values.portPrometheus,
						protocol: values.protocolPrometheus
					}
				};
			} else if (title === 'lvm') {
				sendData.storage = {
					support: [
						{
							name: values.lvmName,
							namespace: values.lvmNamespace,
							type: 'lvm'
						}
					]
				};
			} else if (title === 'local-path') {
				sendData.storage = {
					support: [
						{
							name: values.localPathName,
							namespace: values.localPathNamespace,
							type: 'local-path'
						}
					]
				};
			}
			console.log(sendData);
			if (status === 0) {
				cutInComponent(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '组件接入成功'
						});
						onCancel();
						setRefreshCluster(true);
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				putComponent(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: `组件${
								status === 1 ? '接入' : '编辑'
							}成功`
						});
						onCancel();
						setRefreshCluster(true);
						onRefresh();
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

	const childrenRender = () => {
		switch (title) {
			case 'minio':
				return <MinioRender data={form.getFieldValue} form={form} />;
			case 'prometheus':
				return <PrometheusRender />;
			case 'alertmanager':
				return <AlertRender />;
			case 'grafana':
				return <GrafanaRender />;
			case 'logging':
				return <LoggingRender />;
			case 'ingress':
				return <IngressRender />;
			case 'lvm':
				return <LvmRender />;
			case 'local-path':
				return <LocalPathRender />;
			default:
				break;
		}
	};
	return (
		<Modal
			title={`工具${status === 0 || status === 1 ? '接入' : '编辑'}`}
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			width={580}
			okText="确定"
			cancelText="取消"
		>
			<div className="access-title-content">
				<div className="access-title-name">
					完善{status === 0 || status === 1 ? '接入' : '编辑'}信息
				</div>
			</div>
			<p className="access-subtitle">
				若您的集群已经安装了对应工具，可直接
				{status === 0 || status === 1 ? '接入' : '编辑'}
				使用
			</p>
			<div className="access-form-content">
				<Form labelAlign="left" form={form}>
					{childrenRender()}
				</Form>
			</div>
		</Modal>
	);
};
export default AccessForm;
