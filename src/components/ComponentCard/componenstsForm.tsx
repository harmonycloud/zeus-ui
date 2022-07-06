import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Switch, Row, Col } from 'antd';
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
		span: 8
	},
	wrapperCol: {
		span: 16
	}
};
const FormItem = Form.Item;
const Option = Select.Option;
export const PrometheusRender = () => (
	<FormItem
		{...formItemLayout}
		labelAlign="left"
		label="prometheus地址"
		style={{ marginBottom: 0 }}
	>
		<Row>
			<Col span={6}>
				<FormItem name="protocolPrometheus">
					<Select
						style={{
							width: '100%'
						}}
					>
						<Select.Option value="https">https</Select.Option>
						<Select.Option value="http">http</Select.Option>
					</Select>
				</FormItem>
			</Col>
			<Col span={12}>
				<FormItem
					required
					rules={[{ required: true, message: '请输入ip地址' }]}
					style={{
						marginLeft: -2
					}}
					name="hostPrometheus"
				>
					<Input type="text" placeholder="请输入主机地址" />
				</FormItem>
			</Col>
			<Col span={6}>
				<FormItem
					required
					rules={[{ required: true, message: '请输入端口' }]}
					style={{
						marginLeft: -2
					}}
					name="portPrometheus"
				>
					<Input type="number" placeholder="端口" />
				</FormItem>
			</Col>
		</Row>
	</FormItem>
);
export const IngressRender = () => (
	<>
		<FormItem
			{...formItemLayout}
			label="Ingress名称"
			required
			rules={[{ required: true, message: '请输入Ingress名称' }]}
			name="ingressClassName"
			labelAlign="left"
		>
			<Input
				type="text"
				defaultValue="nginx-ingress-controller"
				placeholder="请输入Ingress名称"
			/>
		</FormItem>
		<FormItem
			{...formItemLayout}
			label="Ingress地址"
			required
			rules={[{ required: true, message: '请输入Ingress地址' }]}
			labelAlign="left"
			name="ingressAddress"
		>
			<Input type="text" placeholder="请输入主机地址" />
		</FormItem>
		<FormItem
			{...formItemLayout}
			label="ConfigMap分区"
			required
			rules={[{ required: true, message: '请输入分区' }]}
			name="namespace"
			labelAlign="left"
		>
			<Input type="text" placeholder="请输入分区" />
		</FormItem>
		<FormItem
			{...formItemLayout}
			label="ConfigMap名称"
			required
			name="configMapName"
			rules={[{ required: true, message: '请输入ConfigMap名称' }]}
			labelAlign="left"
		>
			<Input type="text" placeholder="请输入ConfigMap名称" />
		</FormItem>
	</>
);
export const LoggingRender = () => (
	<>
		<FormItem
			{...formItemLayout}
			labelAlign="left"
			label="ES地址"
			style={{ marginBottom: 0 }}
		>
			<Row>
				<Col span={6}>
					<FormItem name="protocolEs">
						<Select
							style={{
								width: '100%'
							}}
						>
							<Select.Option value="https">https</Select.Option>
							<Select.Option value="http">http</Select.Option>
						</Select>
					</FormItem>
				</Col>
				<Col span={12}>
					<FormItem
						required
						rules={[{ required: true, message: '请输入ip地址' }]}
						style={{
							marginLeft: -2
						}}
						name="hostEs"
					>
						<Input type="text" placeholder="请输入主机地址" />
					</FormItem>
				</Col>
				<Col span={6}>
					<FormItem
						required
						rules={[{ required: true, message: '请输入端口' }]}
						style={{
							marginLeft: -2
						}}
						name="portEs"
					>
						<Input type="number" placeholder="端口" />
					</FormItem>
				</Col>
			</Row>
		</FormItem>
		<FormItem
			{...formItemLayout}
			labelAlign="left"
			label="ES鉴权"
			style={{ marginBottom: 0 }}
		>
			<Row gutter={4}>
				<Col>
					<FormItem name="userEs">
						<Input placeholder="请输入用户名" />
					</FormItem>
				</Col>
				<Col>
					<FormItem name="passwordEs">
						<Input.Password placeholder="请输入密码" />
					</FormItem>
				</Col>
			</Row>
		</FormItem>
		<FormItem
			{...formItemLayout}
			labelAlign="left"
			label="ES日志采集工具"
			style={{ marginBottom: 0 }}
			name="logCollect"
		>
			<Switch />
		</FormItem>
	</>
);
export const GrafanaRender = () => (
	<FormItem
		{...formItemLayout}
		labelAlign="left"
		label="grafana地址"
		style={{ marginBottom: 0 }}
	>
		<Row>
			<Col span={6}>
				<FormItem name="protocolGrafana">
					<Select
						style={{
							width: '100%'
						}}
					>
						<Select.Option value="https">https</Select.Option>
						<Select.Option value="http">http</Select.Option>
					</Select>
				</FormItem>
			</Col>
			<Col span={12}>
				<FormItem
					required
					rules={[{ required: true, message: '请输入ip地址' }]}
					style={{
						marginLeft: -2
					}}
					name="hostGrafana"
				>
					<Input type="text" placeholder="请输入主机地址" />
				</FormItem>
			</Col>
			<Col span={6}>
				<FormItem
					required
					rules={[{ required: true, message: '请输入端口' }]}
					style={{
						marginLeft: -2
					}}
					name="portGrafana"
				>
					<Input type="number" placeholder="端口" />
				</FormItem>
			</Col>
		</Row>
	</FormItem>
);
export const AlertRender = () => (
	<FormItem
		{...formItemLayout}
		labelAlign="left"
		label="监控告警地址"
		style={{ marginBottom: 0 }}
	>
		<Row>
			<Col span={6}>
				<FormItem name="protocolAlert">
					<Select
						style={{
							width: '100%'
						}}
					>
						<Select.Option value="https">https</Select.Option>
						<Select.Option value="http">http</Select.Option>
					</Select>
				</FormItem>
			</Col>
			<Col span={12}>
				<FormItem
					required
					rules={[{ required: true, message: '请输入ip地址' }]}
					style={{
						marginLeft: -2
					}}
					name="hostAlert"
				>
					<Input type="text" placeholder="请输入主机地址" />
				</FormItem>
			</Col>
			<Col span={6}>
				<FormItem
					style={{
						marginLeft: -2
					}}
					required
					rules={[{ required: true, message: '请输入端口' }]}
					name="portAlert"
				>
					<Input type="number" placeholder="端口" />
				</FormItem>
			</Col>
		</Row>
	</FormItem>
);
export const MinioRender = (props: any) => {
	const { form, data } = props;
	const [head, setHead] = useState<string>('http://');
	const [mid, setMid] = useState<string>();
	const [tail, setTail] = useState<number>();
	const { endpoint } = data;
	useEffect(() => {
		form.setFieldsValue({
			endpoint: head + mid + ':' + tail + ''
		});
	}, [head, mid, tail]);
	useEffect(() => {
		if (endpoint) {
			const endpoints = endpoint.split(':');
			setHead(`${endpoints[0]}://`);
			setMid(
				endpoints[1].substring(2) === 'undefined'
					? ''
					: endpoints[1].substring(2)
			);
			setTail(endpoints[2]);
		}
	}, [endpoint]);
	const handleChange = (value: any, type: string) => {
		switch (type) {
			case 'head':
				setHead(value);
				break;
			case 'mid':
				setMid(value);
				break;
			case 'tail':
				setTail(value);
				break;
			default:
				break;
		}
	};
	const select = (
		<Select onChange={(value) => handleChange(value, 'head')} value={head}>
			<Option value="https://">https://</Option>
			<Option value="http://">http://</Option>
		</Select>
	);
	const input = (
		<Input
			type="number"
			onChange={(value) => handleChange(value, 'tail')}
			style={{ width: '80px' }}
			value={tail}
		/>
	);
	return (
		<>
			<FormItem
				{...formItemLayout2}
				label="Access Key ID"
				required
				labelAlign="left"
				name="accessKeyId"
			>
				<Input />
			</FormItem>
			<FormItem
				{...formItemLayout2}
				label="Bucket名称"
				required
				labelAlign="left"
				name="bucketName"
			>
				<Input />
			</FormItem>
			<FormItem
				{...formItemLayout2}
				label="Minio名称"
				required
				labelAlign="left"
				name="minioName"
			>
				<Input />
			</FormItem>
			<FormItem
				{...formItemLayout2}
				label="Minio地址"
				required
				labelAlign="left"
			>
				<Input.Group>
					<Row>
						<Col span={6}>
							<Select
								onChange={(value) =>
									handleChange(value, 'head')
								}
								value={head}
								style={{ width: '100%' }}
							>
								<Option value="https://">https://</Option>
								<Option value="http://">http://</Option>
							</Select>
						</Col>
						<Col span={12}>
							<Input
								style={{ width: '100%' }}
								value={mid}
								onChange={(value) => handleChange(value, 'mid')}
							/>
						</Col>
						<Col span={6}>
							<Input
								type="number"
								onChange={(value) =>
									handleChange(value, 'tail')
								}
								style={{ width: '100%' }}
								value={tail}
							/>
						</Col>
					</Row>
				</Input.Group>
			</FormItem>
			<FormItem
				{...formItemLayout2}
				label="Access Key Secret"
				required
				labelAlign="left"
				name="secretAccessKey"
			>
				<Input />
			</FormItem>
		</>
	);
};
export const LvmRender = () => {
	return (
		<>
			<FormItem
				{...formItemLayout}
				label="名称"
				required
				rules={[{ required: true, message: '请输入名称' }]}
				name="lvmName"
				labelAlign="left"
			>
				<Input type="text" placeholder="请输入名称" />
			</FormItem>
			<FormItem
				{...formItemLayout}
				label="分区"
				required
				rules={[{ required: true, message: '请输入分区' }]}
				name="lvmNamespace"
			>
				<Input type="text" placeholder="请输入分区" />
			</FormItem>
		</>
	);
};
export const LocalPathRender = () => {
	return (
		<>
			<FormItem
				{...formItemLayout}
				label="名称"
				required
				rules={[{ required: true, message: '请输入名称' }]}
				name="localPathName"
			>
				<Input type="text" placeholder="请输入名称" />
			</FormItem>
			<FormItem
				{...formItemLayout}
				label="分区"
				required
				rules={[{ required: true, message: '请输入分区' }]}
				name="localPathNamespace"
			>
				<Input type="text" placeholder="请输入分区" />
			</FormItem>
		</>
	);
};
