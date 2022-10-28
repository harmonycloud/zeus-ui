import { resProps } from '@/types/comment';
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
	clusterId: string;
	namespace: string;
	middlewareName: string;
	editData: PgsqslDatabaseItem | undefined;
	onRefresh: () => void;
}
export interface MysqlEditTableProps {
	tableName?: string;
	dbName: string;
}
export interface PgsqlEditTableProps {
	isEdit?: boolean;
	dbName: string;
	schemaName: string;
	tableName?: string;
}
export interface MysqlTableInfoProps {
	handleChange: (values: any) => void;
	originData: MysqlTableDetail | undefined;
}
export interface MysqlColInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}

export interface MysqlIndexInfoProps {
	originData: MysqlTableDetail | undefined;
	handleChange: (values: any) => void;
}
export interface MysqlForeignKeyInfoProps {
	originData: MysqlTableDetail | undefined;
	handleChange: (values: any) => void;
}
export interface PgsqlTableInfoProps {
	handleChange: (values: any) => void;
	dbName: string;
	schemaName: string;
	data: pgsqlTableDetail | undefined;
}
export interface PgsqlColInfoProps {
	originData: PgsqlColItem[];
	handleChange: (values: any) => void;
	clusterId: string;
	namespace: string;
	middlewareName: string;
}
export interface PgForeignKeyInfoProps {
	originData: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
	databaseName: string;
	schemaName: string;
	clusterId: string;
	namespace: string;
	middlewareName: string;
}
export interface PgExclusivenessProps {
	originData: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
	databaseName: string;
}
export interface PgUniquenessProps {
	originData: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
}
export interface PgExamineProps {
	originData: tableCheckItem[];
	handleChange: (values: any) => void;
}
export interface PgInheritProps {
	data: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
	databaseName: string;
	schemaName: string;
	clusterId: string;
	namespace: string;
	middlewareName: string;
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
export interface PgsqlTableItem {
	collate: string;
	columnDtoList: null;
	databaseName: string;
	description: string;
	encoding: string;
	fillFactor: string;
	oid: string;
	owner: string;
	schemaName: string;
	tableCheckList: null;
	tableExclusionList: null;
	tableForeignKeyList: null;
	tableInheritList: null;
	tableName: string;
	tableUniqueList: null;
	tablespace: string;
}
export interface getPgsqlTableRes extends resProps {
	data: PgsqlTableItem[];
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
export interface getPgColParamsProps extends SendDataParamsProps {
	databaseName: string;
	schemaName: string;
	tableName: string;
}
export interface getSchemasParamsProps extends SendDataParamsProps {
	databaseName: string;
}
export interface deleteSchemaParamsProps extends getSchemasParamsProps {
	schemaName: string;
}
export interface deletePgTableParamsProps extends deleteSchemaParamsProps {
	tableName: string;
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
export interface deleteAllDatabaseProps extends AllSendDataParamsProps {
	databaseName: string;
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
export interface includesCol {
	columnName: string;
	indexType: string;
	keyName: string;
	subPart: number;
}
export interface IndexItem {
	index: string;
	indexColumns: includesCol[];
	storageType: string;
	type: string;
	comment: string;
}
export interface getIndexRes extends resProps {
	data: IndexItem[];
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
export interface PgTableDetailProps {
	dbName: string;
	schemaName: string;
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

export interface GetEncodingRes extends resProps {
	data: string[];
}
export interface PgsqlColItem {
	array: boolean;
	collate: string | undefined;
	column: string;
	columnName: string;
	comment: string;
	databaseName: string;
	dateType: string;
	defaultValue: string;
	encoding: string;
	inc: boolean;
	nullable: boolean;
	num: string;
	oid: string;
	owner: string;
	primaryKey: boolean;
	schemaName: string;
	size: string;
	tableName: string;
}
export interface getPgColRes extends resProps {
	data: PgsqlColItem[];
}
export interface createPgDatabaseParamsProps extends SendDataParamsProps {
	databaseName: string;
	encoding: string;
	owner: string;
	tablespace: string;
}
export interface resetPasswordParamsProps extends SendDataParamsProps {
	username: string;
}
export interface enablePgsqlUserParamsProps extends SendDataParamsProps {
	username: string;
	enable: boolean;
}
export interface enableMysqlUserParamsProps extends SendDataParamsProps {
	username: string;
	lock: string;
}
export interface getUserAuthParamsProps extends AllSendDataParamsProps {
	username: string;
}
export interface PgsqlUserAuthItem {
	authority: string;
	database: string;
	grantAble: boolean;
	schema: string;
	table: string;
}
export interface PgsqlUserAuthRes extends resProps {
	data: PgsqlUserAuthItem[];
}
export interface MysqlUserAuthItem {
	db: string;
	privilege: string;
	privilegeType: number;
	table: string;
	username: string;
	grantAble: boolean;
}
export interface MysqlUserAuthRes extends resProps {
	data: MysqlUserAuthItem[];
}
export interface mysqlAuthDatabaseParamsProps extends SendDataParamsProps {
	database: string;
	db: string;
	privilegeType: number;
	grantAble: boolean;
	table?: string;
}
export interface pgsqlAuthParamsProps extends SendDataParamsProps {
	username: string;
	database: string;
	schema?: string | null;
	table?: string | null;
	authority: string;
	grantAble: boolean;
}
export interface cancelAuthParamsProps extends AllSendDataParamsProps {
	username: string;
	authorityList: PgsqlUserAuthItem[] | MysqlUserAuthItem[];
}
export interface getPgsqlExcelParamsProps extends SendDataParamsProps {
	databaseName: string;
	schemaName: string;
	tableName: string;
}
export interface getMysqlExcelParamsProps extends SendDataParamsProps {
	database: string;
	table: string;
}
export interface pgsqlTableDetail {
	collate?: string;
	columnDtoList?: PgsqlColItem[];
	databaseName?: string;
	description?: string;
	encoding?: string;
	fillFactor?: string;
	oid?: string;
	owner?: string;
	schemaName?: string;
	tableCheckList?: tableCheckItem[];
	tableExclusionList?: exclusionItem[];
	tableForeignKeyList?: pgsqlForeignKeyItem[];
	tableInheritList?: inheritItem[];
	tableName?: string;
	tableUniqueList?: pgsqlUniqueItem[];
	tablespace?: string;
}
export interface pgsqlTableDetailRes extends resProps {
	data: pgsqlTableDetail;
}
export interface tableCheckItem {
	name: string;
	noInherit: boolean;
	notValid: boolean;
	oid: string;
	operator: string;
}
export interface ExclusionContentItem {
	columnName: string;
	order: string;
	symbol: string;
}
export interface exclusionItem {
	columnName: string;
	contentList: ExclusionContentItem[];
	deferrablity: string;
	indexMethod: string;
	name: string;
	oid: string;
	operator: string;
	symbol: string;
}
export interface ForeignKeyContentItem {
	columnName: string;
	targetColumn: string;
}
export interface pgsqlForeignKeyItem {
	columnName: string;
	contentList: ForeignKeyContentItem[];
	deferrablity: string;
	name: string;
	oid: string;
	onDelete: string;
	onUpdate: string;
	operator: string;
	targetColumn: string;
	targetSchema: string;
	targetTable: string;
}
export interface inheritItem {
	databaseName: string;
	oid: string;
	operator: string;
	schemaName: string;
	tableName: string;
}
export interface pgsqlUniqueItem {
	columnName: string;
	deferrablity: string;
	name: string;
	oid: string;
	operator: string;
}
export interface OrderDtoItem {
	column: string;
	order: string;
}
export interface getPgDataTypeRes extends resProps {
	data: string[];
}
export interface MysqlTableDetail {
	autoIncrement: number;
	charset: string;
	collate: string;
	columns: MysqlColItem[];
	comment: string;
	foreignKeys: MysqlForeignItem[];
	indices: IndexItem[];
	maxRows: null;
	minRows: null;
	rowFormat: null;
	rows: number;
	tableName: string;
}
export interface MysqlForeignItem {
	column: string;
	foreignKey: string;
	referenceTable: string;
	referencedColumn: string;
}
