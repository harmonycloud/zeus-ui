import React, { useEffect, useState } from 'react';
import {
	Modal,
	Form,
	Select,
	Radio,
	Row,
	Col,
	Checkbox,
	notification,
	Tooltip
} from 'antd';
import { formItemLayout618 } from '@/utils/const';
import {
	getAllDatabase,
	getPgTables,
	getSchemas,
	pgsqlAuthData,
	mysqlAuthDatabase,
	mysqlAuthTable,
	getDbTables
} from '@/services/operatorPanel';
import {
	DatabaseItem,
	MysqlTableItem,
	MysqlUserItem,
	PgsqlTableItem,
	PgsqlUserItem,
	PgsqlDatabaseItem,
	SchemaItem
} from '../index.d';
import { QuestionCircleOutlined } from '@ant-design/icons';
interface AuthorizationFormProps {
	open: boolean;
	onCancel: () => void;
	type: string;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	user: MysqlUserItem | PgsqlUserItem | undefined;
	onRefresh: () => void;
}
const radiosOptions = [
	{ label: '只读', value: 1 },
	{ label: '管理', value: 2 },
	{ label: '读写', value: 3 }
];
const pgsqlRadiosOptions = [
	{ label: '访问', value: 'readOnly' },
	{ label: '读写', value: 'readWrite' }
];
const mysqlOptions = [
	{ value: 'database', label: '数据库' },
	{ value: 'table', label: '数据表' }
];
const pgsqlOptions = [
	{ value: 'database', label: '数据库' },
	{ value: 'schema', label: '模式' },
	{ value: 'table', label: '数据表' }
];
function returnOptionsByType(type: string) {
	switch (type) {
		case 'mysql':
			return mysqlOptions;
		case 'postgresql':
			return pgsqlOptions;
		default:
			return mysqlOptions;
	}
}
const { Option } = Select;
export default function AuthorizationForm(
	props: AuthorizationFormProps
): JSX.Element {
	const [form] = Form.useForm();
	const {
		open,
		onCancel,
		type,
		middlewareName,
		clusterId,
		namespace,
		user,
		onRefresh
	} = props;
	const [options] = useState(returnOptionsByType(type));
	const [authType, setAuthType] = useState<string>('database');
	const [databases, setDatabases] = useState<
		DatabaseItem[] | PgsqlDatabaseItem[]
	>([]);
	const [currentDatabase, setCurrentDatabase] = useState<string>();
	const [schemas, setSchemas] = useState<SchemaItem[]>([]);
	const [currentSchema, setCurrentSchema] = useState<string>();
	const [tables, setTables] = useState<PgsqlTableItem[] | MysqlTableItem[]>(
		[]
	);
	const handleChange = (value: string) => setAuthType(value);
	useEffect(() => {
		getAllDatabase({
			middlewareName: middlewareName,
			clusterId: clusterId,
			namespace: namespace,
			type: type
		}).then((res) => {
			if (res.success) {
				setDatabases(res.data);
			} else {
				notification.error({
					message: '失败',
					description: (
						<>
							<p>{res.errorMsg}</p>
							<p>{res.errorDetail}</p>
						</>
					)
				});
			}
		});
	}, []);
	useEffect(() => {
		if (currentDatabase) {
			if (type === 'mysql') {
				getDbTables({
					clusterId,
					namespace,
					middlewareName,
					database: currentDatabase
				}).then((res) => {
					if (res.success) {
						setTables(res.data);
					}
				});
			} else {
				getSchemas({
					clusterId,
					namespace,
					middlewareName,
					databaseName: currentDatabase
				}).then((res) => {
					if (res.success) {
						setSchemas(res.data);
					}
				});
			}
		}
	}, [currentDatabase]);
	useEffect(() => {
		const dbTemp = form.getFieldValue('database');
		const schemaTemp = form.getFieldValue('schema');
		if (dbTemp) {
			setCurrentDatabase(dbTemp);
			if (type === 'mysql') {
				getDbTables({
					clusterId,
					namespace,
					middlewareName,
					database: dbTemp
				}).then((res) => {
					if (res.success) {
						setTables(res.data);
					}
				});
			} else {
				getSchemas({
					clusterId,
					namespace,
					middlewareName,
					databaseName: dbTemp
				}).then((res) => {
					if (res.success) {
						setSchemas(res.data);
					}
				});
			}
		}
		if (dbTemp && schemaTemp) {
			setCurrentDatabase(dbTemp);
			setCurrentSchema(schemaTemp);
			getPgTables({
				clusterId,
				namespace,
				middlewareName,
				databaseName: dbTemp,
				schemaName: schemaTemp
			}).then((res) => {
				if (res.success) {
					setTables(res.data);
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
					});
				}
			});
		}
	}, [authType]);
	useEffect(() => {
		if (currentDatabase && currentSchema) {
			getPgTables({
				clusterId,
				namespace,
				middlewareName,
				databaseName: currentDatabase,
				schemaName: currentSchema
			}).then((res) => {
				if (res.success) {
					setTables(res.data);
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
					});
				}
			});
		}
	}, [currentSchema]);
	const onOk = () => {
		form.validateFields().then((values) => {
			onCancel();
			if (type === 'mysql') {
				if (authType === 'database') {
					mysqlAuthDatabase({
						clusterId,
						namespace,
						middlewareName,
						database: values.database,
						db: values.database,
						privilegeType: Number(values.authority),
						grantAble: values.grantAble,
						username: (user as MysqlUserItem).user
					})
						.then((res) => {
							if (res.success) {
								notification.success({
									message: '成功',
									description: '用户授权成功!'
								});
							} else {
								notification.error({
									message: '失败',
									description: (
										<>
											<p>{res.errorMsg}</p>
											<p>{res.errorDetail}</p>
										</>
									)
								});
							}
						})
						.finally(() => {
							onRefresh();
						});
				} else {
					mysqlAuthTable({
						clusterId,
						namespace,
						middlewareName,
						database: values.database,
						db: values.database,
						privilegeType: Number(values.authority),
						grantAble: values.grantAble,
						table: values.table,
						username: (user as MysqlUserItem).user
					})
						.then((res) => {
							if (res.success) {
								notification.success({
									message: '成功',
									description: '用户授权成功!'
								});
							} else {
								notification.error({
									message: '失败',
									description: (
										<>
											<p>{res.errorMsg}</p>
											<p>{res.errorDetail}</p>
										</>
									)
								});
							}
						})
						.finally(() => {
							onRefresh();
						});
				}
			} else {
				pgsqlAuthData({
					clusterId,
					namespace,
					middlewareName,
					username: (user as PgsqlUserItem).username,
					database: values.database,
					table: values.table || null,
					schema: values.schema || null,
					authority: values.authority,
					grantAble: values.grantAble
				})
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '用户授权成功!'
							});
						} else {
							notification.error({
								message: '失败',
								description: (
									<>
										<p>{res.errorMsg}</p>
										<p>{res.errorDetail}</p>
									</>
								)
							});
						}
					})
					.finally(() => {
						onRefresh();
					});
			}
		});
	};
	return (
		<Modal
			title="授权"
			onCancel={onCancel}
			open={open}
			width={600}
			onOk={onOk}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item
					label="授权类型"
					name="authType"
					initialValue={authType}
					required
				>
					<Select
						options={options}
						value={authType}
						onChange={handleChange}
					/>
				</Form.Item>
				{authType === 'database' && (
					<Form.Item
						label="授权对象"
						name="database"
						rules={[{ required: true, message: '请选择授权对象' }]}
					>
						<Select placeholder="请选择授权对象">
							{databases.map(
								(item: DatabaseItem | PgsqlDatabaseItem) => (
									<Option
										value={
											type === 'mysql'
												? (item as DatabaseItem).db
												: (item as PgsqlDatabaseItem)
														.databaseName
										}
										key={
											type === 'mysql'
												? (item as DatabaseItem).db
												: (item as PgsqlDatabaseItem)
														.databaseName
										}
									>
										{type === 'mysql'
											? (item as DatabaseItem).db
											: (item as PgsqlDatabaseItem)
													.databaseName}
									</Option>
								)
							)}
						</Select>
					</Form.Item>
				)}
				{authType === 'table' && type === 'mysql' && (
					<Form.Item required label="授权对象" name="auth">
						<Row>
							<Col span={12}>
								<Form.Item
									name="database"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择数据库'
										}
									]}
								>
									<Select
										placeholder="请选择数据库"
										value={currentDatabase}
										onChange={(value: any) => {
											setTables([]);
											setCurrentDatabase(value);
										}}
									>
										{databases.map(
											(
												item:
													| DatabaseItem
													| PgsqlDatabaseItem
											) => (
												<Option
													value={
														(item as DatabaseItem)
															.db
													}
													key={
														(item as DatabaseItem)
															.db
													}
												>
													{(item as DatabaseItem).db}
												</Option>
											)
										)}
									</Select>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									name="table"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择授权对象'
										}
									]}
								>
									<Select placeholder="请选择授权对象">
										{tables.map(
											(
												item:
													| PgsqlTableItem
													| MysqlTableItem
											) => (
												<Option
													key={item.tableName}
													value={item.tableName}
												>
													{item.tableName}
												</Option>
											)
										)}
									</Select>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>
				)}
				{authType === 'schema' && (
					<Form.Item required label="授权对象" name="auth">
						<Row>
							<Col span={12}>
								<Form.Item
									name="database"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择数据库'
										}
									]}
								>
									<Select
										placeholder="请选择数据库"
										value={currentDatabase}
										onChange={(value: any) => {
											setSchemas([]);
											setTables([]);
											setCurrentDatabase(value);
										}}
									>
										{databases.map(
											(
												item:
													| DatabaseItem
													| PgsqlDatabaseItem
											) => (
												<Option
													value={
														(
															item as PgsqlDatabaseItem
														).databaseName
													}
													key={
														(
															item as PgsqlDatabaseItem
														).databaseName
													}
												>
													{
														(
															item as PgsqlDatabaseItem
														).databaseName
													}
												</Option>
											)
										)}
									</Select>
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item
									name="schema"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择授权对象'
										}
									]}
								>
									<Select placeholder="请选择授权对象">
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
							</Col>
						</Row>
					</Form.Item>
				)}
				{authType === 'table' && type === 'postgresql' && (
					<Form.Item required label="授权对象" name="auth">
						<Row>
							<Col span={8}>
								<Form.Item
									name="database"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择数据库'
										}
									]}
								>
									<Select
										placeholder="请选择数据库"
										value={currentDatabase}
										onChange={(value: any) => {
											setSchemas([]);
											setTables([]);
											setCurrentDatabase(value);
										}}
									>
										{databases.map(
											(
												item:
													| DatabaseItem
													| PgsqlDatabaseItem
											) => (
												<Option
													value={
														(
															item as PgsqlDatabaseItem
														).databaseName
													}
													key={
														(
															item as PgsqlDatabaseItem
														).databaseName
													}
												>
													{
														(
															item as PgsqlDatabaseItem
														).databaseName
													}
												</Option>
											)
										)}
									</Select>
								</Form.Item>
							</Col>
							<Col span={8}>
								<Form.Item
									name="schema"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择模式'
										}
									]}
								>
									<Select
										placeholder="请选择授权对象"
										value={currentSchema}
										onChange={(value: any) => {
											setTables([]);
											setCurrentSchema(value);
										}}
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
							</Col>
							<Col span={8}>
								<Form.Item
									name="table"
									noStyle
									rules={[
										{
											required: true,
											message: '请选择授权对象'
										}
									]}
								>
									<Select placeholder="请选择授权对象">
										{tables.map(
											(
												item:
													| PgsqlTableItem
													| MysqlTableItem
											) => (
												<Option
													key={item.tableName}
													value={item.tableName}
												>
													{item.tableName}
												</Option>
											)
										)}
									</Select>
								</Form.Item>
							</Col>
						</Row>
					</Form.Item>
				)}
				<Form.Item
					label={
						<span>
							<span>授权设置</span>
							<Tooltip
								title={
									type === 'mysql'
										? `只读权限包括
SELECT,LOCK TABLES,SHOW VIEW,PROCESS,REPLICATION SLAVE,REPLICATION CLIENT操作
读写权限包括
SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,REFERENCES,INDEX,ALTER,CREATE TEMPORARY TABLES,LOCK TABLES,EXECUTE,CREATE VIEW,SHOW VIEW,EVENT,TRIGGER,CREATE ROUTINE,ALTER ROUTINE,PROCESS,REPLICATION SLAVE,REPLICATION CLIENT操作
管理权限包括
CREATE,DROP,INDEX,ALTER,CREATE TEMPORRY TABLES,LOCK TABLES,CREATE VIEW,SHOW VIEW,
CREARE ROUTINE,ALTER ROUTINE,PROCESS,REPLICATION SLAVE,REPLICATION CLIENT操作`
										: `database访问权限包括connect操作 读写权限包括create temporary操作
schema访问权限包括usage操作 读写权限包括create操作
table只读权限包括select操作 读写权限包括insert update delete truncate references trigger操作`
								}
							>
								<QuestionCircleOutlined
									style={{ marginLeft: 4 }}
								/>
							</Tooltip>
						</span>
					}
					name="authority"
					rules={[{ required: true, message: '请选择权限' }]}
				>
					<Radio.Group
						options={
							type === 'mysql'
								? radiosOptions
								: pgsqlRadiosOptions
						}
					/>
				</Form.Item>
				<Form.Item
					label="权限传递"
					name="grantAble"
					valuePropName="checked"
				>
					<Checkbox />
				</Form.Item>
			</Form>
		</Modal>
	);
}
