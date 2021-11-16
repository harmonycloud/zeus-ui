import React, { useState } from 'react';
import {
	Dialog,
	Field,
	Form,
	Input,
	Select,
	Grid,
	Switch
} from '@alicloud/console-components';
import pattern from '@/utils/pattern';
import {
	PrometheusRender,
	IngressRender,
	LoggingRender,
	GrafanaRender,
	AlertRender,
	MinioRender
} from './componenstsForm';
import './index.scss';

interface AccessFormProps {
	visible: boolean;
	onCancel: () => void;
	title: string;
	clusterId: string;
}
const AccessForm = (props: AccessFormProps) => {
	const { visible, onCancel, title } = props;
	const field = Field.useField();
	console.log(props);
	const onOk = () => {
		field.validate((errors, values) => {
			if (errors) return;
			console.log(values);
		});
	};

	const childrenRender = () => {
		switch (title) {
			case 'minio':
				return <MinioRender />;
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
			title="工具接入"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
		>
			<div className="access-title-content">
				<div className="access-title-name">完善接入信息</div>
			</div>
			<p className="access-subtitle">
				若您的资源池已经安装了对应工具，可直接接入使用
			</p>
			<div className="access-form-content">
				<Form field={field}>{childrenRender()}</Form>
			</div>
		</Dialog>
	);
};
export default AccessForm;
