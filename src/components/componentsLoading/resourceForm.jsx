import React from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Select
} from '@alicloud/console-components';
import pattern from '@/utils/pattern';
import './index.scss';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
	labelCol: {
		fixedSpan: 8
	},
	wrapperCol: {
		span: 14
	}
};
export default function ResourceForm(props) {
	const { onCreate, onCancel, visible } = props;
	const field = Field.useField();

	const onOk = () => {
		field.validate((err, values) => {
			if (err) return;

			onCreate(values);
		});
	};
	return (
		<Dialog
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			title="参数对接"
			style={{ width: '480px' }}
			footerAlign="right"
		>
			<Form {...formItemLayout} field={field}>
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="form-title">Grafana对接参数</div>
				</div>
				<div style={{ marginLeft: 7 }}>
					<FormItem
						label="主机"
						required
						requiredMessage="请输入主机地址"
						labelTextAlign="left"
						asterisk={false}
						{...formItemLayout}
						className="ne-required-ingress"
						pattern={pattern.host}
						patternMessage="请输入正确的主机地址"
					>
						<Input
							name="grafana.host"
							placeholder="请输入主机地址"
						/>
					</FormItem>
					<FormItem
						label="端口"
						required
						requiredMessage="请输入端口号"
						labelTextAlign="left"
						{...formItemLayout}
						asterisk={false}
						className="ne-required-ingress"
					>
						<Input
							name="grafana.port"
							htmlType="number"
							placeholder="请输入端口号"
						/>
					</FormItem>
					<FormItem
						label="协议"
						required
						labelTextAlign="left"
						{...formItemLayout}
						asterisk={false}
						className="ne-required-ingress"
					>
						<Select
							style={{ width: '100%' }}
							name="grafana.protocol"
							defaultValue="http"
						>
							<Option value="http">HTTP</Option>
							<Option value="https">HTTPS</Option>
						</Select>
					</FormItem>
					<FormItem
						label="Token"
						required
						requiredMessage="请输入Token"
						labelTextAlign="left"
						{...formItemLayout}
						asterisk={false}
						className="ne-required-ingress"
					>
						<Input.TextArea
							name="grafana.token"
							placeholder="请输入Token"
						/>
					</FormItem>
				</div>
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="form-title">Prometheus对接参数</div>
				</div>
				<div style={{ marginLeft: 7 }}>
					<FormItem
						label="主机"
						required
						requiredMessage="请输入主机IP"
						labelTextAlign="left"
						asterisk={false}
						className="ne-required-ingress"
						pattern={pattern.host}
						{...formItemLayout}
						patternMessage="请输入正确的主机地址"
					>
						<Input
							name="prometheus.host"
							placeholder="请输入主机IP"
						/>
					</FormItem>
					<FormItem
						label="端口"
						required
						requiredMessage="请输入端口号"
						labelTextAlign="left"
						asterisk={false}
						{...formItemLayout}
						className="ne-required-ingress"
					>
						<Input
							name="prometheus.port"
							htmlType="number"
							placeholder="请输入端口号"
						/>
					</FormItem>
					<FormItem
						label="协议"
						required
						labelTextAlign="left"
						asterisk={false}
						{...formItemLayout}
						className="ne-required-ingress"
					>
						<Select
							style={{ width: '100%' }}
							name="prometheus.protocol"
							defaultValue="http"
						>
							<Option value="http">HTTP</Option>
							<Option value="https">HTTPS</Option>
						</Select>
					</FormItem>
				</div>
			</Form>
		</Dialog>
	);
}
