import React, { useEffect, useState } from 'react';
import { Dialog, Field, Form, Message } from '@alicloud/console-components';
import { putComponent, cutInComponent, getCluster } from '@/services/common';
import {
	PrometheusRender,
	IngressRender,
	LoggingRender,
	GrafanaRender,
	AlertRender,
	MinioRender
} from './componenstsForm';
import messageConfig from '../messageConfig';
import storage from '@/utils/storage';
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
	const field = Field.useField();
	useEffect(() => {
		getCluster({ clusterId: clusterId, detail: true }).then((res) => {
			if (res.success) {
				const cluster = res.data;
				if (cluster.ingress) {
					field.setValues({
						ingressAddress: cluster.ingress.address,
						ingressClassName: cluster.ingress.ingressClassName,
						namespace: cluster.ingress.tcp.namespace,
						configMapName: cluster.ingress.tcp.configMapName
					});
				}
				if (cluster.logging && cluster.logging.elasticSearch) {
					field.setValues({
						protocolEs: cluster.logging.elasticSearch.protocol,
						hostEs: cluster.logging.elasticSearch.host,
						portEs: cluster.logging.elasticSearch.port,
						userEs: cluster.logging.elasticSearch.user,
						passwordEs: cluster.logging.elasticSearch.password,
						logCollect: cluster.logging.elasticSearch.logCollect
					});
				}
				if (cluster.monitor?.alertManager) {
					field.setValues({
						protocolAlert: cluster.monitor.alertManager.protocol,
						hostAlert: cluster.monitor.alertManager.host,
						portAlert: cluster.monitor.alertManager.port
					});
				}
				if (cluster.monitor?.grafana) {
					field.setValues({
						protocolGrafana: cluster.monitor.grafana.protocol,
						hostGrafana: cluster.monitor.grafana.host,
						portGrafana: cluster.monitor.grafana.port
					});
				}
				if (cluster.monitor?.prometheus) {
					field.setValues({
						protocolPrometheus: cluster.monitor.prometheus.protocol,
						hostPrometheus: cluster.monitor.prometheus.host,
						portPrometheus: cluster.monitor.prometheus.port
					});
				}
				if (cluster?.storage?.backup?.storage) {
					field.setValues({
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
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	const onOk = () => {
		field.validate((errors, values: any) => {
			if (errors) return;
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
			}
			// console.log(sendData);
			if (status === 0) {
				cutInComponent(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '组件接入成功')
						);
						onCancel();
						setRefreshCluster(true);
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			} else {
				putComponent(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								`组件${status === 1 ? '接入' : '编辑'}成功`
							)
						);
						onCancel();
						setRefreshCluster(true);
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};

	const childrenRender = () => {
		switch (title) {
			case 'minio':
				return <MinioRender data={field.getValues()} field={field} />;
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
			default:
				break;
		}
	};
	return (
		<Dialog
			title={`工具${status === 0 || status === 1 ? '接入' : '编辑'}`}
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: '580px' }}
		>
			<div className="access-title-content">
				<div className="access-title-name">
					完善{status === 0 || status === 1 ? '接入' : '编辑'}信息
				</div>
			</div>
			<p className="access-subtitle">
				若您的资源池已经安装了对应工具，可直接
				{status === 0 || status === 1 ? '接入' : '编辑'}
				使用
			</p>
			<div className="access-form-content">
				<Form field={field}>{childrenRender()}</Form>
			</div>
		</Dialog>
	);
};
export default AccessForm;
