import React, { useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Select,
	Radio
} from '@alicloud/console-components';
import { valuesProps, consoleProps } from '../detail';

const { Group: RadioGroup } = Radio;
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
const list = [
	{
		value: 'database',
		label: '进入数据库'
	},
	{
		value: 'container',
		label: '进入容器'
	}
];
const mysqlDatabaseContainer: string[] = ['mysql'];
const redisDatabaseContainer: string[] = ['redis-cluster'];
export default function Console(props: consoleProps): JSX.Element {
	const { visible, onCancel, containers, data } = props;
	const [source, setSource] = useState<string>('');
	const field = Field.useField();
	const onOk = () => {
		const values: valuesProps = field.getValues();
		const url = `terminalType=console&scriptType=${values.scriptType}&container=${values.container}&pod=${data.podName}&namespace=${data.namespace}&clusterId=${data.clusterId}`;
		window.open(
			`#/terminal/${url}/${data.type}/${source}/${data.name}`,
			'_blank',
			'height=600, width=800, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no'
		);
		onCancel();
	};
	const optionsRender = () => {
		if (source === 'database') {
			if (data.type === 'mysql') {
				return mysqlDatabaseContainer.map(
					(item: string, index: number) => {
						return (
							<Option key={index} value={item}>
								{item}
							</Option>
						);
					}
				);
			} else if (data.type === 'redis') {
				return redisDatabaseContainer.map(
					(item: string, index: number) => {
						return (
							<Option key={index} value={item}>
								{item}
							</Option>
						);
					}
				);
			}
		} else {
			return containers.map((item: string, index: number) => {
				return (
					<Option key={index} value={item}>
						{item}
					</Option>
				);
			});
		}
	};

	return (
		<Dialog
			title="实例控制台"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: '400px' }}
		>
			<Form {...formItemLayout} field={field}>
				{(data.type === 'mysql' || data.type === 'redis') && (
					<FormItem>
						<RadioGroup
							name="source"
							dataSource={list}
							value={source}
							onChange={(value: string | number | boolean) =>
								setSource(value as string)
							}
						/>
					</FormItem>
				)}
				<FormItem label="选择容器">
					<Select
						name="container"
						style={{ width: '100%' }}
						defaultValue={containers[0]}
					>
						{optionsRender()}
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
