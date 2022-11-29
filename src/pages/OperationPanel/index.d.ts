import { resProps } from '@/types/comment';
export interface ParamsProps {
	currentTab: string;
	type: string;
	name: string;
	projectId: string;
	clusterId: string;
	namespace: string;
	version: string;
	mode: string;
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
	editData: PgsqlDatabaseItem | undefined;
	onRefresh: () => void;
}
export interface MysqlEditTableProps {
	tableName?: string;
	dbName: string;
	removeActiveKey: () => void;
}
export interface PgsqlEditTableProps {
	isEdit?: boolean;
	dbName: string;
	schemaName: string;
	tableName?: string;
	removeActiveKey: () => void;
}
export interface MysqlTableInfoProps {
	handleChange: (values: any) => void;
	originData: MysqlTableDetail | undefined;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	engineData: MysqlEngineItem[];
	tableName: string | undefined;
	databaseName: string;
	removeActiveKey: () => void;
	cancel: () => void;
}
export interface MysqlColInfoProps {
	originData: MysqlTableDetail | undefined;
	handleChange: (values: any) => void;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	tableName: string | undefined;
	databaseName: string;
	removeActiveKey: () => void;
	cancel: () => void;
}

export interface MysqlIndexInfoProps {
	originData: MysqlTableDetail | undefined;
	handleChange: (values: any) => void;
	engineData: MysqlEngineItem[];
	clusterId: string;
	namespace: string;
	middlewareName: string;
	tableName: string | undefined;
	databaseName: string;
	removeActiveKey: () => void;
	cancel: () => void;
}
export interface MysqlForeignKeyInfoProps {
	originData: MysqlTableDetail | undefined;
	handleChange: (values: any) => void;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	tableName: string | undefined;
	databaseName: string;
	removeActiveKey: () => void;
	cancel: () => void;
}
export interface PgsqlTableTabProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	tableName: string | undefined;
	removeActiveKey: () => void;
	cancel: () => void;
}
export interface PgsqlTableInfoProps extends PgsqlTableTabProps {
	handleChange: (values: any) => void;
	dbName: string;
	schemaName: string;
	data: pgsqlTableDetail | undefined;
}
export interface PgsqlColInfoProps extends PgsqlTableTabProps {
	originData: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
	databaseName: string;
	schemaName: string;
}
export interface PgForeignKeyInfoProps extends PgsqlTableTabProps {
	originData: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
	databaseName: string;
	schemaName: string;
}
export interface PgExclusivenessProps extends PgsqlTableTabProps {
	originData: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
	databaseName: string;
}
export interface PgUniquenessProps extends PgsqlTableTabProps {
	originData: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
}
export interface PgExamineProps extends PgsqlTableTabProps {
	originData: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
}
export interface PgInheritProps extends PgsqlTableTabProps {
	data: pgsqlTableDetail | undefined;
	handleChange: (values: any) => void;
	databaseName: string;
	schemaName: string;
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
	version: string;
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
export interface DatabaseMagProps {
	currentUser: consoleUser | undefined;
}
export interface SqlAuditProps {
	currentUser: consoleUser | undefined;
}
export interface AccountMagProps {
	currentUser: consoleUser | undefined;
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
export interface PgsqlDatabaseItem {
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
	data: PgsqlDatabaseItem[];
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
	rows?: number;
}
export interface getPgsqlTableRes extends resProps {
	data: PgsqlTableItem[];
}
export interface SendDataParamsProps {
	clusterId: string;
	namespace: string;
	middlewareName?: string;
	name?: string;
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
	add: (label: string, children: any) => void;
}
export interface PgTableDetailProps {
	dbName: string;
	schemaName: string;
	add: (label: string, children: any) => void;
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
	dataType: string;
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
	oid?: string;
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
	username: string;
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
	autoIncrement?: number;
	charset?: string;
	collate?: string;
	columns?: MysqlColItem[];
	comment?: string;
	engine?: string;
	foreignKeys?: MysqlForeignItem[];
	indices?: IndexItem[];
	maxRows?: null;
	minRows?: null;
	rowFormat?: null;
	rows?: number;
	tableName?: string;
	newTableName?: string;
}
export interface MysqlForeignItemDetailItem {
	column: string;
	foreignKey: string;
	referenceTable: string;
	referencedColumn: string;
	referenceDatabase: string;
}
export interface MysqlForeignItem {
	column: string;
	foreignKey: string;
	referenceTable: string;
	referencedColumn: string;
	referenceDatabase: string;
	onDeleteOption: string;
	onUpdateOption: string;
	details: MysqlForeignItemDetailItem[] | string[];
}
export interface RedisCMDParamsProps extends SendDataParamsProps {
	cmd: string;
	database: string;
}
export interface getExecuteHisParamsProps extends SendDataParamsProps {
	start: string;
	end: string;
	keyword: string;
	database: string;
}
export interface getRedisKeysParamsProps extends SendDataParamsProps {
	database: string;
	keyword: string;
}
export interface RedisKeyItem {
	expiration: string;
	hashValue: {
		field: string;
		value: string;
	};
	key: string;
	keyType: string;
	listDto: {
		count: number;
		fromLeft: false;
		value: string;
	};
	value: string;
	zsetValue: {
		member: string;
		score: number;
	};
}
export interface RedisKesRes extends resProps {
	data: RedisKeyItem[];
}
export interface getRedisValueParamsProps extends SendDataParamsProps {
	database: string;
	key: string;
}
export interface RedisValueRes extends resProps {
	data: RedisKeyItem;
}
export interface updateRedisKeyParamsProps
	extends getRedisValueParamsProps,
		RedisKeyItem {
	// newName: string;
}
export interface deleteRedisValueParamsProps
	extends getRedisValueParamsProps,
		RedisKeyItem {
	value: string;
}
export interface updatePgsqlForeignParamsProps
	extends SendDataParamsProps,
		pgsqlTableDetail {
	databaseName: string;
	schemaName: string;
	tableName: string;
}
export interface updatePgsqlInfoParamsProps
	extends SendDataParamsProps,
		pgsqlTableDetail {
	databaseName: string;
	table: string;
	schema: string;
}
export interface MysqlDataType {
	autoIncrement: boolean;
	id: number;
	name: string;
	optionsAble: boolean;
}
export interface getMysqlDataTypeRes extends resProps {
	data: MysqlDataType[];
}
export interface createMysqlTableParams
	extends SendDataParamsProps,
		MysqlTableDetail {
	database: string;
}
export interface MysqlEngineItem {
	engine: string;
	indexTypes: string[];
	storageTypes: string[];
	supportForeignKey: boolean;
}
export interface getMysqlEnginesRes extends resProps {
	data: MysqlEngineItem[];
}
export interface UpdateMysqlTableParamsProps
	extends SendDataParamsProps,
		MysqlTableDetail {
	database: string;
	table: string;
}

interface executeMysqlSqlParamsProps extends SendDataParamsProps {
	database: string;
	sql: string;
}

export interface MysqlSqlConsoleProps {
	dbName: string;
	setRefreshFlag: (flag: boolean) => void;
}
export interface PgsqlSqlConsoleProps {
	dbName: string;
}
export interface RedisSqlConsoleProps {
	dbName: string;
	setRefreshFlag: (flag: boolean) => void;
}
export interface MysqlCodeConsoleProps {
	dbName: string;
	sql: string;
	setSql: (values: string) => void;
	handleExecute: () => void;
	isCopy: boolean;
}

export interface ExecuteResultTypeOneProps {
	resData: any;
}
export interface ExecuteResultTypeTwoProps {
	res: any;
}
export interface getExecuteHistoryParamsProps extends SendDataParamsProps {
	database: string;
	ascExecDateOrder: boolean | null;
	ascExecTimeOrder: boolean | null;
	endTime: string | null;
	keyword: string;
	pageNum: number;
	size: number;
	startTime: string | null;
	// status: boolean | null;
	execStatus: boolean | null;
}

export interface ExecuteItem {
	clusterId: string;
	execDate: string;
	execTime: string;
	id: number;
	line: number;
	message: string;
	middlewareName: string;
	namespace: string;
	sqlStr: string;
	execStatus: string;
	targetDatabase: string;
}
export interface getExecuteHistoryRes extends resProps {
	data: {
		list: ExecuteItem[];
		total: number;
		[propsName: string]: any;
	};
}
export interface ExecutionTableProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	database: string;
	changeSql: (values: string) => void;
	refreshFlag?: boolean;
	setRefreshFlag: (flag: boolean) => void;
	execute: {
		refreshFlag: boolean;
	};
}
export interface executePgsqlSqlParamsProps extends SendDataParamsProps {
	databaseName: string;
	sql: string;
}
export interface SqlAuditParamsProps extends SendDataParamsProps {
	current: number;
	endTime: string | null;
	searchWord: string;
	size: number;
	startTime: string | null;
}
// 后端这个接口定义的很恶心
export interface SqlAuditItem {
	clientip: string;
	db: string;
	ip: string;
	lockTime: string;
	query: string;
	queryAction: string;
	queryDate: string;
	queryTime: string;
	rowsExamined: string;
	rowsSent: string;
	status: string;
	timestampMysql: string;
	user: string;
}

export interface getPgsqlTableRowsParamsProps extends SendDataParamsProps {
	databaseName: string;
	tableName: string;
	schemaName: string;
}
export interface getPgsqlTableRowsRes extends resProps {
	data: number;
}
