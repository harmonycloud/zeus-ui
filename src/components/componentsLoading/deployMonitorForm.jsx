import React from 'react';
import { Dialog, Form, Field, Input } from '@alicloud/console-components';
import './index.scss';
const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		fixedSpan: 8
	},
	wrapperCol: {
		span: 14
	}
};
export default function DeployMonitorForm(props) {
	const { onCreate, onCancel, visible } = props;
	const field = Field.useField();

	const onOk = () => {
		field.validate((err, values) => {
			console.log(err);
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
			title="部署参数"
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
						label="对外访问端口"
						required
						labelTextAlign="left"
						asterisk={false}
						{...formItemLayout}
						className="ne-required-ingress"
						min={3000}
						max={39000}
						minmaxMessage="端口范围为3000-39000正整数"
						requiredMessage="对外访问端口是必填数据"
					>
						<Input
							name="grafana.port"
							htmlType="number"
							placeholder="请输入端口号"
						/>
					</FormItem>
				</div>
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="form-title">Prometheus对接参数</div>
				</div>
				<div style={{ marginLeft: 7 }}>
					<FormItem
						label="对外访问端口"
						required
						labelTextAlign="left"
						asterisk={false}
						{...formItemLayout}
						className="ne-required-ingress"
						min={3000}
						max={39000}
						minmaxMessage="端口范围为3000-39000正整数"
						requiredMessage="对外访问端口是必填数据"
					>
						<Input
							name="prometheus.port"
							htmlType="number"
							placeholder="请输入端口号"
						/>
					</FormItem>
				</div>
			</Form>
		</Dialog>
	);
}
