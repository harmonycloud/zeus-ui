import React, { useEffect } from 'react';
import { Modal, Form, notification } from 'antd';
import {
	putComponent,
	cutInComponent,
	getCluster,
	getLogCollect
} from '@/services/common';
import {
	PrometheusRender,
	LoggingRender,
	GrafanaRender,
	AlertRender,
	MinioRender,
	LvmRender,
	LocalPathRender,
	MiddlewareApiRender
} from './componenstsForm';
import './index.scss';

interface AccessFormProps {
	visible: boolean;
	onCancel: () => void;
	title: string;
	clusterId: string;
	onRefresh: () => void;
	status: number;
	componentData: any;
}

const AccessForm = (props: AccessFormProps) => {
	const {
		visible,
		onCancel,
		title,
		clusterId,
		onRefresh,
		status,
		componentData
	} = props;
	const [form] = Form.useForm();
	useEffect(() => {
		if (componentData.component === 'logging') {
			getLogCollect({ clusterId: componentData.clusterId }).then(
				(res) => {
					if (res.success) {
						form.setFieldsValue({
							logCollect: res.data
						});
					} else {
						form.setFieldsValue({
							logCollect: false
						});
					}
				}
			);
		}
	}, []);
	useEffect(() => {
		form.setFieldsValue({
			protocolAlert: componentData.protocol,
			hostAlert: componentData.host,
			portAlert: componentData.port
		});
		form.setFieldsValue({
			protocolGrafana: componentData.protocol,
			hostGrafana: componentData.host,
			portGrafana: componentData.port
		});
		form.setFieldsValue({
			protocolPrometheus: componentData.protocol,
			hostPrometheus: componentData.host,
			portPrometheus: componentData.port
		});
		form.setFieldsValue({
			protocolEs: componentData.protocol,
			hostEs: componentData.host,
			portEs: componentData.port,
			userEs: componentData.username,
			passwordEs: componentData.password
		});
		form.setFieldsValue({
			protocolAPI: componentData.protocol,
			hostAPI: componentData.host,
			portAPI: componentData.port
		});
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData: any = {
				clusterId,
				componentName: title
			};
			if (title === 'grafana') {
				sendData.host = values.hostGrafana;
				sendData.port = values.portGrafana;
				sendData.protocol = values.protocolGrafana;
			} else if (title === 'logging') {
				sendData.protocol = values.protocolEs;
				sendData.host = values.hostEs;
				sendData.port = values.portEs;
				sendData.user = values.userEs;
				sendData.password = values.passwordEs;
				sendData.logCollect = values.logCollect;
			} else if (title === 'alertmanager') {
				sendData.host = values.hostAlert;
				sendData.port = values.portAlert;
				sendData.protocol = values.protocolAlert;
			} else if (title === 'prometheus') {
				sendData.host = values.hostPrometheus;
				sendData.port = values.portPrometheus;
				sendData.protocol = values.protocolPrometheus;
			} else if (title === 'middleware-controller') {
				sendData.host = values.hostAPI;
				sendData.port = values.portAPI;
				sendData.protocol = values.protocolAPI;
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
			case 'lvm':
				return <LvmRender />;
			case 'local-path':
				return <LocalPathRender />;
			case 'middleware-controller':
				return <MiddlewareApiRender />;
			default:
				break;
		}
	};
	return (
		<Modal
			title={`工具${status === 0 || status === 1 ? '接入' : '编辑'}`}
			open={visible}
			onCancel={onCancel}
			onOk={onOk}
			width={650}
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
