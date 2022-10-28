import React, { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Select, Space } from 'antd';
import { formItemLayout618 } from '@/utils/const';
import { MysqlTableInfoProps } from '../../index.d';

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
export default function MysqlTableInfo(
	props: MysqlTableInfoProps
): JSX.Element {
	const { handleChange, originData } = props;
	const [form] = Form.useForm();
	useEffect(() => {
		if (originData) {
			form.setFieldsValue({
				//  TODO 编辑表字段回显
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
				name="storageEngine"
				initialValue="InnoDB"
				required
			>
				<Select options={storageEngineOptions} />
			</Form.Item>
			<Form.Item label="字符集" name="charset" required>
				<Select options={[]} />
			</Form.Item>
			<Form.Item label="校验规则" name="collate">
				<Select options={[]} />
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
