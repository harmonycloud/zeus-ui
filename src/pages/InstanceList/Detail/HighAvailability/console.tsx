import React, { useState } from 'react';
import { Dialog, Form, Field, Select } from '@alicloud/console-components';
import { useHistory } from 'react-router';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};
interface consoleProps {
	visible: boolean;
	onCancel: () => void;
	containers: string[];
	data: {
		clusterId: string;
		namespace: string;
		podName: string;
	};
}
interface valuesProps {
	container: string;
	scriptType: string;
}
export default function Console(props: consoleProps): JSX.Element {
	const { visible, onCancel, containers, data } = props;
	const field = Field.useField();
	const onOk = () => {
		const values: valuesProps = field.getValues();
		const url = `terminalType=console&scriptType=${values.scriptType}&container=${values.container}&pod=${data.podName}&namespace=${data.namespace}&clusterId=${data.clusterId}`;
		window.open(
			`#/terminal/${url}`,
			'_blank',
			'height=600, width=800, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no'
		);
		onCancel();
	};
	return (
		<Dialog
			title="打开控制台"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: '400px' }}
		>
			<Form {...formItemLayout} field={field}>
				<FormItem label="选择容器">
					<Select
						name="container"
						style={{ width: '100%' }}
						defaultValue={containers[0]}
					>
						{containers.map((item: string, index: number) => {
							return (
								<Option key={index} value={item}>
									{item}
								</Option>
							);
						})}
					</Select>
				</FormItem>
				<FormItem label="shell类型">
					<Select
						name="scriptType"
						style={{ width: '100%' }}
						defaultValue="sh"
					>
						<Option value="sh">sh</Option>
						<Option value="bash">bash</Option>
					</Select>
				</FormItem>
			</Form>
		</Dialog>
	);
}
