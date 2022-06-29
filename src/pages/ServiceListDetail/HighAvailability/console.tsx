import React, { useState } from 'react';
import { Modal, Form, Select, Radio, RadioChangeEvent } from 'antd';
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
		value: 'container',
		label: '进入容器'
	},
	{
		value: 'database',
		label: '进入数据库'
	}
];
const mysqlDatabaseContainer: string[] = ['mysql'];
const redisDatabaseContainer: string[] = ['redis-cluster'];
export default function Console(props: consoleProps): JSX.Element {
	const [form] = Form.useForm();
	const { visible, onCancel, containers, data } = props;
	const [source, setSource] = useState<string>('container');
	const [container, setContainer] = useState<string>(
		data.type === 'mysql'
			? mysqlDatabaseContainer[0]
			: data.type === 'redis'
			? redisDatabaseContainer[0]
			: containers[0]
	);
	// const field = Field.useField();
	const onOk = () => {
		const values: valuesProps = form.getFieldsValue();
		const url = `middlewareName=${data.name}&middlewareType=${data.type}&source=${source}&terminalType=console&scriptType=${values.scriptType}&container=${values.container}&pod=${data.podName}&namespace=${data.namespace}&clusterId=${data.clusterId}`;
		window.open(
			`#/terminal/${url}`,
			'_blank',
			'height=600, width=800, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no'
		);
		onCancel();
	};
	const selectRender = () => {
		if (source === 'database') {
			if (data.type === 'mysql') {
				return (
					<FormItem
						label="选择容器"
						name="container"
						initialValue={mysqlDatabaseContainer[0]}
					>
						<Select
							style={{ width: '100%' }}
							value={mysqlDatabaseContainer[0]}
							onChange={(value: any) => setContainer(value)}
						>
							{mysqlDatabaseContainer.map(
								(item: string, index: number) => {
									return (
										<Option key={index} value={item}>
											{item}
										</Option>
									);
								}
							)}
						</Select>
					</FormItem>
				);
			} else if (data.type === 'redis') {
				return (
					<FormItem
						label="选择容器"
						name="container"
						initialValue={redisDatabaseContainer[0]}
					>
						<Select
							style={{ width: '100%' }}
							value={redisDatabaseContainer[0]}
							onChange={(value: any) => setContainer(value)}
						>
							{redisDatabaseContainer.map(
								(item: string, index: number) => {
									return (
										<Option key={index} value={item}>
											{item}
										</Option>
									);
								}
							)}
						</Select>
					</FormItem>
				);
			}
		} else {
			return (
				<FormItem
					label="选择容器"
					name="container"
					initialValue={container}
				>
					<Select
						style={{ width: '100%' }}
						value={container}
						onChange={(value: any) => setContainer(value)}
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
			);
		}
	};

	return (
		<Modal
			title="实例控制台"
			visible={visible}
			onCancel={onCancel}
			// onClose={onCancel}
			onOk={onOk}
			width={400}
			// style={{ width: '400px' }}
		>
			<Form labelAlign="left" {...formItemLayout} form={form}>
				{(data.type === 'mysql' || data.type === 'redis') && (
					<FormItem name="source" initialValue={'container'}>
						<RadioGroup
							options={list}
							value={source}
							onChange={(e: RadioChangeEvent) => {
								setSource(e.target.value);
								data.type === 'mysql'
									? setContainer(mysqlDatabaseContainer[0])
									: setContainer(redisDatabaseContainer[0]);
							}}
						/>
					</FormItem>
				)}
				{selectRender()}
				<FormItem label="shell类型" name="scriptType" initialValue="sh">
					<Select style={{ width: '100%' }}>
						<Option value="sh">sh</Option>
						<Option value="bash">bash</Option>
					</Select>
				</FormItem>
			</Form>
		</Modal>
	);
}
