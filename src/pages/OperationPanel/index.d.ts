import { resProps } from '@/types/comment';
import { number } from 'echarts';
export interface ParamsProps {
	currentTab: string;
	type: string;
	name: string;
	projectId: string;
	clusterId: string;
	namespace: string;
}
export interface RoleDetailParamsProps extends ParamsProps {
	userName: string;
}
export interface AddAccountProps {
	open: boolean;
	onCancel: () => void;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	onRefresh: (keyword?: string) => void;
}
export interface AddDatabaseProps {
	open: boolean;
	onCancel: () => void;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	editData: DatabaseItem | undefined;
	onRefresh: () => void;
}
export interface AddPgDatabaseProps {
	open: boolean;
	onCancel: () => void;
}
export interface MysqlEditTableProps {
	isEdit?: boolean;
}
export interface PgsqlEditTableProps {
	isEdit?: boolean;
}
export interface MysqlTableInfoProps {
	isEdit: boolean;
	handleChange: (values: any) => void;
}
export interface MysqlColInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}

export interface MysqlIndexInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface MysqlForeignKeyInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgsqlTableInfoProps {
	isEdit: boolean;
	handleChange: (values: any) => void;
}
export interface PgsqlColInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgForeignKeyInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgExclusivenessProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgUniquenessProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgExamineProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgInheritProps {
	isEdit: boolean;
	handleChange: (values: any) => void;
}
export interface consoleUser {
	username: string;
	mwToken: string;
}
export interface LoginConsoleProps {
	open: boolean;
	onCancel: () => void;
	currentUser: consoleUser | undefined;
	projectId: string;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	middlewareType: string;
	onCreate: (values: consoleUser) => void;
}
export interface OperatorHeaderProps {
	currentUser: consoleUser | undefined;
	loginOut: () => void;
}
export interface SqlConsoleProps {
	currentUser: consoleUser | undefined;
	setOpen: (value: boolean) => void;
}
declare global {
	interface Window {
		sqlFormatter: any;
	}
}

export interface AuthLoginRes extends resProps {
	data: {
		mwToken: string;
		username: string;
	};
}
export interface DatabaseItem {
	db: string;
	character: string;
	collate: string;
}
export interface PgsqslDatabaseItem {
	collate: string;
	comment: string;
	databaseName: string;
	encoding: string;
	oid: string;
	owner: string;
	tablespace: string;
}
export interface GetDatabasesRes extends resProps {
	data: DatabaseItem[];
}
export interface getPgDatabaseRes extends resProps {
	data: PgsqslDatabaseItem[];
}
export interface MysqlTableItem {
	tableName: string;
	charset: string;
	collate: string;
	rows: number;
	autoIncrement: number;
	minRows: number;
	maxRows: number;
	comment: null | string;
}
export interface SendDataParamsProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
}
export interface AllSendDataParamsProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
}
export interface getSchemasParamsProps extends SendDataParamsProps {
	databaseName: string;
}
export interface deleteSchemaParamsProps extends getSchemasParamsProps {
	schemaName: string;
}
export interface createSchemaParamsProps extends getSchemasParamsProps {
	comment: string;
	owner: string;
	schemaName: string;
}

export interface deleteUserParamsProps extends AllSendDataParamsProps {
	username: string;
}
export interface mysqlCreateUserParamsProps extends AllSendDataParamsProps {
	user: string;
	password: string;
	grantAble: boolean;
}
export interface pgsqlCreateUserParamsProps extends AllSendDataParamsProps {
	username: string;
	inherit: boolean;
	password: string;
}
export interface getAllUserParamsProps extends AllSendDataParamsProps {
	keyword: string;
}
export interface updateParamsProps extends SendDataParamsProps {
	db: string;
	character: string;
	collate: string;
}
export interface deleteParamsProps extends SendDataParamsProps {
	database: string;
}
export interface getCollationParamsProps extends SendDataParamsProps {
	charset: string;
}
export interface charSetResProps extends resProps {
	data: string[];
}
export interface getTablesParamsProps extends SendDataParamsProps {
	database: string;
}
export interface getTablesResProps extends resProps {
	data: MysqlTableItem[];
}
export interface getColParamsProps extends getTablesParamsProps {
	table: string;
}
export interface MysqlColItem {
	autoIncrement: boolean;
	charset: string;
	collate: string;
	column: string;
	columnDefault: string;
	columnType: string | null;
	comment: string;
	dateType: string;
	primary: boolean;
	nullable: boolean;
	primaryKey: boolean;
	size: number;
}
export interface getColsResProps extends resProps {
	data: MysqlColItem[];
}
export interface MysqlUserItem {
	accountLocked: boolean;
	grantAble: boolean;
	id: string;
	lastLoginTime: string;
	password: string;
	user: string;
}
export interface authorityItem {
	authority: string;
	database: string;
	grantAble: boolean;
	schema: string;
	table: string;
}
export interface PgsqlUserItem {
	authorityList: authorityItem[];
	id: string;
	inherit: boolean;
	lastLoginTime: string;
	password: string;
	usable: boolean;
	username: string;
}
export interface getMysqlUserResProps extends resProps {
	data: MysqlUserItem[];
}
export interface getPgsqlUserResProps extends resProps {
	data: PgsqlUserItem[];
}
export interface TableDetailProps {
	dbName: string;
}
export interface SchemaItem {
	comment: string;
	databaseName: string;
	oid: string;
	owner: string;
	schemaName: string;
}
export interface GetSchemasRes extends resProps {
	data: SchemaItem[];
}
export interface ModeMagProps {
	dbName: string;
}
export interface CreateModeProps {
	open: boolean;
	onCancel: () => void;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	databaseName: string;
	onRefresh: () => void;
	editData: SchemaItem | undefined;
}
