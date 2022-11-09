import React, { useEffect, useState } from 'react';
import {
	Button,
	Divider,
	Form,
	Input,
	InputNumber,
	notification,
	Select,
	Space
} from 'antd';
import { formItemLayout618 } from '@/utils/const';
import { MysqlEngineItem, MysqlTableInfoProps } from '../../index.d';
import {
	getCharset,
	getCollation,
	updateMysqlTableInfo
} from '@/services/operatorPanel';
import { AutoCompleteOptionItem } from '@/types/comment';

const rowFormatOptions = [
	{ label: 'COMPACT', value: 'COMPACT' },
	{ label: 'COMPRESSED', value: 'COMPRESSED' },
	{ label: 'DEFAULT', value: 'DEFAULT' },
	{ label: 'DYNAMIC', value: 'DYNAMIC' },
	{ label: 'FIXED', value: 'FIXED' },
	{ label: 'REDUNDANT', value: 'REDUNDANT' }
];
const { Option } = Select;
export default function MysqlTableInfo(
	props: MysqlTableInfoProps
): JSX.Element {
	const {
		handleChange,
		originData,
		clusterId,
		namespace,
		middlewareName,
		engineData,
		tableName,
		databaseName
	} = props;
	const [form] = Form.useForm();
	const [charsets, setCharsets] = useState<string[]>([]);
	const [currentCharset, setCurrentCharset] = useState<string>('');
	const [collations, setCollations] = useState<string[]>([]);
	const [engineOptions, setEngineOptions] = useState<
		AutoCompleteOptionItem[]
	>([]);
	useEffect(() => {
		if (engineData) {
			const list = engineData.map((item: MysqlEngineItem) => {
				return { label: item.engine, value: item.engine };
			});
			setEngineOptions(list);
		}
	}, [engineData]);

	useEffect(() => {
		const sendData = {
			clusterId,
			middlewareName,
			namespace
		};
		getCharset(sendData).then((res) => {
			if (res.success) {
				setCharsets(res.data);
			}
		});
	}, []);
	useEffect(() => {
		if (currentCharset) {
			const sendData = {
				clusterId,
				middlewareName,
				namespace,
				charset: currentCharset
			};
			getCollation(sendData).then((res) => {
				if (res.success) {
					setCollations(res.data);
				}
			});
		}
	}, [currentCharset]);
	useEffect(() => {
		if (originData) {
			form.setFieldsValue({
				tableName: originData.tableName,
				comment: originData.comment,
				engine: originData.engine,
				charset: originData.charset,
				collate: originData.collate,
				autoIncrement: originData.autoIncrement,
				rowFormat: originData.rowFormat
			});
		}
	}, [originData]);
	const onValuesChange = (changedFields: any, allFields: any) => {
		handleChange(allFields);
	};
	const save = () => {
		console.log('save');
		if (tableName && originData) {
			updateMysqlTableInfo({
				database: databaseName,
				table: tableName,
				clusterId,
				namespace,
				middlewareName,
				tableName: originData.tableName,
				comment: originData.comment,
				engine: originData.engine,
				charset: originData.charset,
				collate: originData.collate,
				autoIncrement: originData.autoIncrement,
				rowFormat: originData.rowFormat
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '表信息修改成功'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	};
	return (
		<>
			<Form
				form={form}
				style={{ width: '50%' }}
				labelAlign="left"
				{...formItemLayout618}
				onValuesChange={onValuesChange}
			>
				<Form.Item
					label="表名"
					name="tableName"
					rules={[{ required: true, message: '请输入表名' }]}
				>
					<Input placeholder="请输入表名" />
				</Form.Item>
				<Form.Item label="备注" name="comment">
					<Input placeholder="请输入备注" />
				</Form.Item>
				<Form.Item label="存储引擎" name="engine" required>
					<Select options={engineOptions} />
				</Form.Item>
				<Form.Item label="字符集" name="charset" required>
					<Select
						placeholder="请选择字符集"
						onChange={(value: any) => setCurrentCharset(value)}
						showSearch
						filterOption={(input, option) =>
							(option!.children as unknown as string)
								.toLowerCase()
								.includes(input.toLowerCase())
						}
					>
						{charsets.map((item: string) => (
							<Option key={item} value={item}>
								{item}
							</Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="校验规则" name="collate">
					<Select
						placeholder="请选择校验规则"
						showSearch
						filterOption={(input, option) =>
							(option!.children as unknown as string)
								.toLowerCase()
								.includes(input.toLowerCase())
						}
					>
						{collations.map((item: string) => (
							<Option key={item} value={item}>
								{item}
							</Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="自增值" name="autoIncrement">
					<InputNumber style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item label="行格式" name="rowFormat">
					<Select options={rowFormatOptions} />
				</Form.Item>
			</Form>
			{tableName && (
				<>
					<Divider />
					<Space>
						<Button type="primary" onClick={save}>
							保存
						</Button>
						<Button>取消</Button>
					</Space>
				</>
			)}
		</>
	);
}
