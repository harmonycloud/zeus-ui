import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, Select, Space } from 'antd';
import { formItemLayout618 } from '@/utils/const';
import { PgInheritProps, PgsqlTableItem, SchemaItem } from '../../index.d';
import { getPgTables, getSchemas } from '@/services/operatorPanel';
const { Option } = Select;
// * 继承
export default function PgInherit(props: PgInheritProps): JSX.Element {
	const {
		data,
		handleChange,
		clusterId,
		namespace,
		middlewareName,
		databaseName
	} = props;
	const [form] = Form.useForm();
	const [schemas, setSchemas] = useState<SchemaItem[]>([]);
	const [selectSchema, setSelectSchema] = useState<string>('');
	const [tables, setTables] = useState<PgsqlTableItem[]>([]);
	const onValuesChange = (changedValues: any, allValues: any) => {
		handleChange(allValues);
	};
	useEffect(() => {
		getSchemas({
			clusterId,
			namespace,
			middlewareName,
			databaseName
		}).then((res) => {
			if (res.success) {
				setSchemas(res.data);
			}
		});
	}, []);
	useEffect(() => {
		if (selectSchema) {
			getPgTables({
				clusterId,
				namespace,
				middlewareName,
				databaseName,
				schemaName: selectSchema
			}).then((res) => {
				if (res.success) {
					setTables(res.data);
				}
			});
		}
	}, [selectSchema]);
	useEffect(() => {
		if (data) {
			// TODO 编辑回显
		}
	}, [data]);
	const save = () => {
		// TODO
	};
	return (
		<>
			<Form
				style={{ width: '60%' }}
				form={form}
				labelAlign="left"
				{...formItemLayout618}
				onValuesChange={onValuesChange}
			>
				<Form.Item label="模式" name="schemaName">
					<Select
						value={selectSchema}
						onChange={(value: string) => setSelectSchema(value)}
					>
						{schemas.map((item: SchemaItem) => (
							<Option
								key={item.schemaName}
								value={item.schemaName}
							>
								{item.schemaName}
							</Option>
						))}
					</Select>
				</Form.Item>
				<Form.Item label="表名（多选）" name="tablesName">
					<Select mode="multiple">
						{tables.map((item: PgsqlTableItem) => (
							<Option value={item.tableName} key={item.tableName}>
								{item.tableName}
							</Option>
						))}
					</Select>
				</Form.Item>
			</Form>
			{data && (
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
