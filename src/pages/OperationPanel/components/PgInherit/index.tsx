import React, { useEffect, useState } from 'react';
import { Button, Divider, Form, notification, Select, Space } from 'antd';
import { formItemLayout618 } from '@/utils/const';
import { PgInheritProps, PgsqlTableItem, SchemaItem } from '../../index.d';
import {
	getPgTables,
	getSchemas,
	updatePgsqlInherit
} from '@/services/operatorPanel';

const { Option } = Select;
// * 继承
export default function PgInherit(props: PgInheritProps): JSX.Element {
	const {
		data,
		handleChange,
		clusterId,
		namespace,
		middlewareName,
		databaseName,
		schemaName,
		tableName
	} = props;
	const [form] = Form.useForm();
	const [schemas, setSchemas] = useState<SchemaItem[]>([]);
	const [selectSchema, setSelectSchema] = useState<string>('');
	const [tables, setTables] = useState<PgsqlTableItem[]>();
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
		if (data?.tableInheritList && data.tableInheritList.length > 0) {
			const tables = data.tableInheritList.map((item) => item.tableName);
			form.setFieldsValue({
				schemaName: data.tableInheritList[0].schemaName,
				tablesName: tables.length > 0 ? tables : undefined
			});
		}
	}, [data]);
	const save = () => {
		if (tableName && data) {
			updatePgsqlInherit({
				databaseName,
				schemaName,
				tableName: tableName,
				clusterId,
				namespace,
				middlewareName,
				tableInheritList: data.tableInheritList
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '继承修改成功'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		} else {
			notification.error({
				message: '失败',
				description: '无法获取当前表名！'
			});
		}
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
						{tables?.map((item: PgsqlTableItem) => (
							<Option value={item.tableName} key={item.tableName}>
								{item.tableName}
							</Option>
						))}
					</Select>
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
