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
const redisSentinelDBContainer: string[] = ['sentinel'];
export default function Console(props: consoleProps): JSX.Element {
	const { visible, onCancel, containers, data, middlewareName } = props;
	const [source, setSource] = useState<string>('container');
	const [container, setContainer] = useState<string>(
		data.type === 'mysql'
			? mysqlDatabaseContainer[0]
			: data.type === 'redis'
			? data.podName.includes(`${middlewareName}-sentinel`)
				? redisSentinelDBContainer[0]
				: redisDatabaseContainer[0]
			: containers[0]
	);
	const field = Field.useField();
	const onOk = () => {
		const values: valuesProps = field.getValues();
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
					<Select
						name="container"
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
				);
			} else if (data.type === 'redis') {
				if (data.podName.includes(`${middlewareName}-sentinel`)) {
					return (
						<Select
							name="container"
							style={{ width: '100%' }}
							value={redisSentinelDBContainer[0]}
							onChange={(value: any) => setContainer(value)}
						>
							{redisSentinelDBContainer.map(
								(item: string, index: number) => {
									return (
										<Option key={index} value={item}>
											{item}
										</Option>
									);
								}
							)}
						</Select>
					);
				} else {
					return (
						<Select
							name="container"
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
					);
				}
			}
		} else {
			return (
				<Select
					name="container"
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
			);
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
							onChange={(value: string | number | boolean) => {
								setSource(value as string);
								data.type === 'mysql'
									? setContainer(mysqlDatabaseContainer[0])
									: data.podName.includes(
											`${middlewareName}-sentinel`
									  )
									? setContainer(redisSentinelDBContainer[0])
									: setContainer(redisDatabaseContainer[0]);
							}}
						/>
					</FormItem>
				)}
				<FormItem label="选择容器">{selectRender()}</FormItem>
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
