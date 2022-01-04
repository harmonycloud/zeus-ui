import React, { useEffect, useState } from 'react';
import {
	Form,
	Input,
	Select,
	Grid,
	Switch
} from '@alicloud/console-components';
import storage from '@/utils/storage';
import pattern from '@/utils/pattern';
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
const FormItem = Form.Item;
const Option = Select.Option;
const { Row, Col } = Grid;
export const PrometheusRender = () => (
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
						<Select.Option value="https">https</Select.Option>
						<Select.Option value="http">http</Select.Option>
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
);
export const IngressRender = () => (
	<>
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
	</>
);
export const LoggingRender = () => (
	<>
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
							<Select.Option value="https">https</Select.Option>
							<Select.Option value="http">http</Select.Option>
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
				// checked={logCollect}
				// onChange={(value) => setLogCollect(value)}
			/>
		</FormItem>
	</>
);
export const GrafanaRender = () => (
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
						<Select.Option value="https">https</Select.Option>
						<Select.Option value="http">http</Select.Option>
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
);
export const AlertRender = () => (
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
						<Select.Option value="https">https</Select.Option>
						<Select.Option value="http">http</Select.Option>
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
);
export const MinioRender = (props: any) => {
	const { field } = props;
	const [head, setHead] = useState<string>('http://');
	const [mid, setMid] = useState<string>();
	const [tail, setTail] = useState<number>();
	useEffect(() => {
		field.setValue('endpoint', head + mid + ':' + tail + '');
	}, [head, mid, tail]);
	useEffect(() => {
		const cluster = JSON.parse(storage.getLocal('cluster'));
		// console.log(cluster);
		if (cluster?.storage?.backup?.storage) {
			const endpoint = cluster.storage.backup.storage.endpoint.split(':');
			setHead(`${endpoint[0]}://`);
			setMid(endpoint[1].substring(2));
			setTail(endpoint[2]);
		}
	}, [props]);
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
			htmlType="number"
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
				<Input.Group addonBefore={select} addonAfter={input}>
					<Input
						style={{ width: '100%' }}
						value={mid}
						onChange={(value) => handleChange(value, 'mid')}
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
		</>
	);
};
