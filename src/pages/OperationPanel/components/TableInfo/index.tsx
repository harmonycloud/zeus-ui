import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Select, Space } from 'antd';
import { formItemLayout618 } from '@/utils/const';

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
export default function TableInfo(): JSX.Element {
	const [form] = Form.useForm();
	const save = () => {
		console.log('save');
	};
	return (
		<>
			<Form
				form={form}
				style={{ width: '50%' }}
				labelAlign="left"
				{...formItemLayout618}
			>
				<Form.Item
					label="表名"
					name="tableName"
					rules={[
						{ required: true, message: '请输入表名' },
						{
							max: 100,
							type: 'string',
							message: '表名长度不超过100'
						}
					]}
				>
					<Input placeholder="请输入表名" />
				</Form.Item>
				<Form.Item
					label="备注"
					name="remark"
					rules={[
						{
							max: 100,
							type: 'string',
							message: '备注长度不超过100'
						}
					]}
				>
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
				<Form.Item
					label="字符集"
					name="characterSet"
					required
					initialValue="utf8mb3"
				>
					<Select options={[]} />
				</Form.Item>
				<Form.Item
					label="校验规则"
					name="rules"
					initialValue="utf8_general_ci"
				>
					<Select options={[]} />
				</Form.Item>
				<Form.Item label="自增值" name="increment">
					<InputNumber style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item
					label="行格式"
					name="rowFormat"
					initialValue="DYNAMIC"
				>
					<Select options={rowFormatOptions} />
				</Form.Item>
			</Form>
			<Space>
				<Button type="primary" onClick={save}>
					保存
				</Button>
				<Button>取消</Button>
			</Space>
		</>
	);
}
