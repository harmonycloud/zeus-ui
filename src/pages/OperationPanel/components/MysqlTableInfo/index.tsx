import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { formItemLayout618 } from '@/utils/const';
import { MysqlTableInfoProps } from '../../index.d';
import { getCharset, getCollation } from '@/services/operatorPanel';

const storageEngineOptions = [
	{ label: 'ROCKSDB', value: 'ROCKSDB' },
	{ label: 'MRG_MYISAM', value: 'MRG_MYISAM' },
	{ label: 'BLACKHOLE', value: 'BLACKHOLE' },
	{ label: 'TokuDB', value: 'TokuDB' },
	{ label: 'ARCHIVE', value: 'ARCHIVE' },
	{ label: 'MyISAM', value: 'MyISAM' },
	{ label: 'InnoDB', value: 'InnoDB' },
	{ label: 'CSV', value: 'CSV' },
	{ label: 'MEMORY', value: 'MEMORY' },
	{ label: 'SPHINX', value: 'SPHINX' }
];
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
	const { handleChange, originData, clusterId, namespace, middlewareName } =
		props;
	const [form] = Form.useForm();
	const [charsets, setCharsets] = useState<string[]>([]);
	const [currentCharset, setCurrentCharset] = useState<string>('');
	const [collations, setCollations] = useState<string[]>([]);

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
	}, []);
	const onValuesChange = (changedFields: any, allFields: any) => {
		handleChange(allFields);
	};
	return (
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
			<Form.Item
				label="存储引擎"
				name="engine"
				initialValue="InnoDB"
				required
			>
				<Select options={storageEngineOptions} />
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
	);
}
