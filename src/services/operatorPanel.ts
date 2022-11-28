import Axios from './request.js';
import * as URL from './operatorPanel.constants';
import {
	AllSendDataParamsProps,
	AuthLoginRes,
	cancelAuthParamsProps,
	charSetResProps,
	createMysqlTableParams,
	createPgDatabaseParamsProps,
	createSchemaParamsProps,
	deleteAllDatabaseProps,
	deleteParamsProps,
	deletePgTableParamsProps,
	deleteRedisValueParamsProps,
	deleteSchemaParamsProps,
	deleteUserParamsProps,
	enableMysqlUserParamsProps,
	enablePgsqlUserParamsProps,
	executeMysqlSqlParamsProps,
	getAllUserParamsProps,
	getCollationParamsProps,
	getColParamsProps,
	getColsResProps,
	GetDatabasesRes,
	GetEncodingRes,
	getExecuteHisParamsProps,
	getExecuteHistoryParamsProps,
	getExecuteHistoryRes,
	getIndexRes,
	getMysqlDataTypeRes,
	getMysqlEnginesRes,
	getMysqlExcelParamsProps,
	getMysqlUserResProps,
	getPgColParamsProps,
	getPgColRes,
	getPgDatabaseRes,
	getPgDataTypeRes,
	getPgsqlExcelParamsProps,
	getPgsqlTableRes,
	getPgsqlUserResProps,
	getRedisKeysParamsProps,
	getRedisValueParamsProps,
	getSchemasParamsProps,
	GetSchemasRes,
	getTablesParamsProps,
	getTablesResProps,
	getUserAuthParamsProps,
	mysqlAuthDatabaseParamsProps,
	mysqlCreateUserParamsProps,
	MysqlUserAuthRes,
	pgsqlAuthParamsProps,
	pgsqlCreateUserParamsProps,
	pgsqlTableDetailRes,
	PgsqlUserAuthRes,
	PgsqlDatabaseItem,
	RedisCMDParamsProps,
	RedisKesRes,
	RedisValueRes,
	resetPasswordParamsProps,
	SendDataParamsProps,
	UpdateMysqlTableParamsProps,
	updateParamsProps,
	updatePgsqlForeignParamsProps,
	updatePgsqlInfoParamsProps,
	updateRedisKeyParamsProps,
	executePgsqlSqlParamsProps,
	SqlAuditParamsProps
} from '@/pages/OperationPanel/index.d';
import { resProps } from '@/types/comment';

export const authLogin: (params: {
	clusterId: string;
	middlewareName: string;
	username: string;
	namespace: string;
	password: string;
	type: string;
}) => Promise<AuthLoginRes> = (params: {
	clusterId: string;
	middlewareName: string;
	username: string;
	namespace: string;
	password: string;
	type: string;
}) => {
	// * 通过mwtoken来判断，当前接口是否需要在请求header中添加mwToken
	return Axios.post(URL.AuthLogin, params, {
		headers: {
			mwtoken: ''
		}
	});
};
export const getDatabases: (
	params: SendDataParamsProps
) => Promise<GetDatabasesRes> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getDatabases, params);
};
export const createDatabase: (params: updateParamsProps) => Promise<resProps> =
	(params: updateParamsProps) => {
		return Axios.json(URL.updateDb, params, {}, 'POST');
	};
export const updateDatabase: (params: updateParamsProps) => Promise<resProps> =
	(params: updateParamsProps) => {
		return Axios.json(URL.updateDb, params, {}, 'PUT');
	};
export const deleteDatabase: (params: deleteParamsProps) => Promise<resProps> =
	(params: deleteParamsProps) => {
		return Axios.delete(URL.deleteDb, params);
	};
export const getCharset: (
	params: SendDataParamsProps
) => Promise<charSetResProps> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getCharset, params);
};
export const getCollation: (
	params: getCollationParamsProps
) => Promise<charSetResProps> = (params: getCollationParamsProps) => {
	return Axios.get(URL.getCollation, params);
};
export const getDbTables: (
	params: getTablesParamsProps
) => Promise<getTablesResProps> = (params: getTablesParamsProps) => {
	return Axios.get(URL.getDbTables, params);
};
export const getCols: (params: getColParamsProps) => Promise<getColsResProps> =
	(params: getColParamsProps) => {
		return Axios.get(URL.getCols, params);
	};
export const getIndexs: (params: getColParamsProps) => Promise<getIndexRes> = (
	params: getColParamsProps
) => {
	return Axios.get(URL.getIndexs, params);
};
export const deleteMysqlTable: (
	params: getColParamsProps
) => Promise<resProps> = (params: getColParamsProps) => {
	return Axios.delete(URL.deleteMysqlTable, params);
};
export const getMysqlUsers: (
	params: SendDataParamsProps
) => Promise<getMysqlUserResProps> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getMysqlUsers, params);
};
export const getSchemas: (
	params: getSchemasParamsProps
) => Promise<GetSchemasRes> = (params: getSchemasParamsProps) => {
	return Axios.get(URL.getSchemas, params);
};
export const createSchemas: (
	params: createSchemaParamsProps
) => Promise<resProps> = (params: createSchemaParamsProps) => {
	return Axios.json(URL.getSchemas, params);
};
export const deleteSchemas: (
	params: deleteSchemaParamsProps
) => Promise<resProps> = (params: deleteSchemaParamsProps) => {
	return Axios.delete(URL.updateSchemas, params);
};
export const updateSchemas: (
	params: createSchemaParamsProps
) => Promise<resProps> = (params: createSchemaParamsProps) => {
	return Axios.json(URL.updateSchemas, params, {}, 'PUT');
};
export const getPgTables: (
	params: deleteSchemaParamsProps
) => Promise<getPgsqlTableRes> = (params: deleteSchemaParamsProps) => {
	return Axios.get(URL.getPgTables, params);
};
export const createPgTable: (params: any) => Promise<resProps> = (
	params: any
) => {
	return Axios.json(URL.getPgTables, params, {}, 'POST');
};
export const deletePgTables: (
	params: deletePgTableParamsProps
) => Promise<resProps> = (params: deletePgTableParamsProps) => {
	return Axios.delete(URL.deletePgTable, params);
};
export const getPgCols: (params: getPgColParamsProps) => Promise<getPgColRes> =
	(params: getPgColParamsProps) => {
		return Axios.get(URL.getPgCols, params);
	};
export const getEncoding: (
	params: SendDataParamsProps
) => Promise<GetEncodingRes> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getEncoding, params);
};
export const createPgDatabase: (
	params: createPgDatabaseParamsProps
) => Promise<resProps> = (params: createPgDatabaseParamsProps) => {
	return Axios.json(URL.createPgDatabase, params);
};
export const updatePgDatabase: (
	params: createPgDatabaseParamsProps
) => Promise<resProps> = (params: createPgDatabaseParamsProps) => {
	return Axios.json(URL.updatePgDatabase, params, {}, 'PUT');
};
export const resetMysqlPassword: (
	params: resetPasswordParamsProps
) => Promise<resProps> = (params: resetPasswordParamsProps) => {
	return Axios.put(URL.resetMysqlPassword, params);
};
export const resetPgsqlPassword: (
	params: resetPasswordParamsProps
) => Promise<resProps> = (params: resetPasswordParamsProps) => {
	return Axios.post(URL.resetPgsqlPassword, params);
};
export const enablePgsqlUser: (
	params: enablePgsqlUserParamsProps
) => Promise<resProps> = (params: enablePgsqlUserParamsProps) => {
	return Axios.get(URL.enablePgsqlUser, params, {}, 'POST');
};
export const enableMysqlUser: (
	params: enableMysqlUserParamsProps
) => Promise<resProps> = (params: enableMysqlUserParamsProps) => {
	return Axios.put(URL.enalbeMysqlUser, params);
};
export const mysqlAuthDatabase: (
	params: mysqlAuthDatabaseParamsProps
) => Promise<resProps> = (params: mysqlAuthDatabaseParamsProps) => {
	return Axios.json(URL.mysqlAuthDatabase, params, {}, 'PUT');
};
export const mysqlAuthTable: (
	params: mysqlAuthDatabaseParamsProps
) => Promise<resProps> = (params: mysqlAuthDatabaseParamsProps) => {
	return Axios.json(URL.mysqlAuthTable, params, {}, 'PUT');
};
export const pgsqlAuthData: (
	params: pgsqlAuthParamsProps
) => Promise<resProps> = (params: pgsqlAuthParamsProps) => {
	return Axios.json(URL.pgsqlAuth, params, {}, 'POST');
};
export const getPgsqlExcel: (params: getPgsqlExcelParamsProps) => string = (
	params: getPgsqlExcelParamsProps
) => {
	const { restUrl } = Axios.restfulAPI(URL.getPgsqlExcel, params);
	return restUrl;
};
export const getPgsqlSQL: (params: getPgsqlExcelParamsProps) => string = (
	params: getPgsqlExcelParamsProps
) => {
	const { restUrl } = Axios.restfulAPI(URL.getPgsqlSQL, params);
	return restUrl;
};
export const getMysqlExcel: (params: getMysqlExcelParamsProps) => string = (
	params: getMysqlExcelParamsProps
) => {
	const { restUrl } = Axios.restfulAPI(URL.getMysqlExcel, params);
	return restUrl;
};
export const getMysqlSQL: (params: getMysqlExcelParamsProps) => string = (
	params: getMysqlExcelParamsProps
) => {
	const { restUrl } = Axios.restfulAPI(URL.getMysqlSQL, params);
	return restUrl;
};
export const getPgsqlTableDetail: (
	params: getPgsqlExcelParamsProps
) => Promise<pgsqlTableDetailRes> = (params: getPgsqlExcelParamsProps) => {
	return Axios.get(URL.getPgsqlTableDetail, params);
};
export const getMysqlData = (params: any) => {
	return Axios.json(URL.getMysqlData, params, {}, 'POST');
};
export const getPgsqlData = (params: any) => {
	return Axios.json(URL.getPgsqlData, params, {}, 'POST');
};
export const updatePgTable = (params: any) => {
	return Axios.json(URL.updatePgTable, params);
};
export const updateMysqlTable = (params: any) => {
	return Axios.json(URL.updateMysqlTable, params, {}, 'PUT');
};
export const getPgsqlDataType: (
	params: SendDataParamsProps
) => Promise<getPgDataTypeRes> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getPgsqlDataType, params);
};
export const getPgsqlCollate: (
	params: SendDataParamsProps
) => Promise<getPgDataTypeRes> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getPgsqlCollate, params);
};
export const getMysqlDetail = (params: getMysqlExcelParamsProps) => {
	return Axios.get(URL.getMysqlDetail, params);
};
export const updatePgsqlForeign: (
	params: updatePgsqlForeignParamsProps
) => Promise<resProps> = (params: updatePgsqlForeignParamsProps) => {
	return Axios.json(URL.updatePgsqlForeign, params, {}, 'PUT');
};
export const updatePgsqlExclusion: (
	params: updatePgsqlForeignParamsProps
) => Promise<resProps> = (params: updatePgsqlForeignParamsProps) => {
	return Axios.json(URL.updatePgsqlExclusion, params, {}, 'PUT');
};
export const updatePgsqlUnique: (
	params: updatePgsqlForeignParamsProps
) => Promise<resProps> = (params: updatePgsqlForeignParamsProps) => {
	return Axios.json(URL.updatePgsqlUnique, params, {}, 'PUT');
};
export const updatePgsqlCheck: (
	params: updatePgsqlForeignParamsProps
) => Promise<resProps> = (params: updatePgsqlForeignParamsProps) => {
	return Axios.json(URL.updatePgsqlCheck, params, {}, 'PUT');
};
export const updatePgsqlInherit: (
	params: updatePgsqlForeignParamsProps
) => Promise<resProps> = (params: updatePgsqlForeignParamsProps) => {
	return Axios.json(URL.updatePgsqlInherit, params, {}, 'PUT');
};
export const updatePgsqlInfo: (
	params: updatePgsqlInfoParamsProps
) => Promise<resProps> = (params: updatePgsqlInfoParamsProps) => {
	return Axios.json(URL.updatePgsqlInfo, params, {}, 'PUT');
};
export const updatePgsqlCol: (
	params: updatePgsqlForeignParamsProps
) => Promise<resProps> = (params: updatePgsqlForeignParamsProps) => {
	return Axios.json(URL.updatePgsqlCol, params, {}, 'PUT');
};
export const getMysqlDataType: (
	params: SendDataParamsProps
) => Promise<getMysqlDataTypeRes> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getMysqlDataType, params);
};
export const createMysqlTable: (
	params: createMysqlTableParams
) => Promise<resProps> = (params: createMysqlTableParams) => {
	return Axios.json(URL.createMysqlTable, params, {}, 'POST');
};
export const getMysqlEngine: (
	params: SendDataParamsProps
) => Promise<getMysqlEnginesRes> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getMysqlEngine, params);
};
export const updateMysqlTableInfo: (
	params: UpdateMysqlTableParamsProps
) => Promise<resProps> = (params: UpdateMysqlTableParamsProps) => {
	return Axios.json(URL.updateMysqlTableInfo, params, {}, 'PUT');
};
export const updateMysqlCol: (
	params: UpdateMysqlTableParamsProps
) => Promise<resProps> = (params: UpdateMysqlTableParamsProps) => {
	return Axios.json(URL.updateMysqlCol, params, {}, 'PUT');
};
export const updateMysqlIndex: (
	params: UpdateMysqlTableParamsProps
) => Promise<resProps> = (params: UpdateMysqlTableParamsProps) => {
	return Axios.json(URL.updateMysqlIndex, params, {}, 'PUT');
};
export const updateMysqlForeign: (
	params: UpdateMysqlTableParamsProps
) => Promise<resProps> = (params: UpdateMysqlTableParamsProps) => {
	return Axios.json(URL.updateMysqlForeign, params, {}, 'PUT');
};
export const executeMysqlSql = (params: executeMysqlSqlParamsProps) => {
	return Axios.post(URL.executeMysqlSql, params);
};
export const executePgsqlSql = (params: executePgsqlSqlParamsProps) => {
	return Axios.post(URL.executePgsqlSql, params);
};
// * -------------------------------------------------
// * redis
export const getRedisDatabases = (params: SendDataParamsProps) => {
	return Axios.get(URL.getRedisDBs, params);
};
export const executeCMD: (params: RedisCMDParamsProps) => Promise<resProps> = (
	params: RedisCMDParamsProps
) => {
	return Axios.post(URL.executeCMD, params);
};
export const getExecuteHis = (params: getExecuteHisParamsProps) => {
	return Axios.get(URL.getRedisExecuteRecords, params);
};
export const getRedisKeys: (
	params: getRedisKeysParamsProps
) => Promise<RedisKesRes> = (params: getRedisKeysParamsProps) => {
	return Axios.get(URL.getRedisKeys, params);
};
export const getRedisValue: (
	params: getRedisValueParamsProps
) => Promise<RedisValueRes> = (params: getRedisValueParamsProps) => {
	return Axios.get(URL.getRedisValue, params);
};
export const updateRedisKeys: (
	params: updateRedisKeyParamsProps
) => Promise<resProps> = (params: updateRedisKeyParamsProps) => {
	return Axios.json(URL.editRedisKey, params, {}, 'PUT');
};
export const updateRedisExpiration: (
	params: updateRedisKeyParamsProps
) => Promise<resProps> = (params: updateRedisKeyParamsProps) => {
	return Axios.json(URL.editRedisExpiration, params, {}, 'PUT');
};
export const updateRedisValue: (
	params: updateRedisKeyParamsProps
) => Promise<resProps> = (params: updateRedisKeyParamsProps) => {
	return Axios.json(URL.deleteRedisValue, params, {}, 'PUT');
};
export const saveRedisKeys: (
	params: updateRedisKeyParamsProps
) => Promise<resProps> = (params: updateRedisKeyParamsProps) => {
	return Axios.json(URL.getRedisValue, params, {}, 'POST');
};
export const deleteRedisKey: (
	params: getRedisValueParamsProps
) => Promise<resProps> = (params: getRedisValueParamsProps) => {
	return Axios.delete(URL.getRedisValue, params);
};
export const deleteRedisValue: (
	params: deleteRedisValueParamsProps
) => Promise<resProps> = (params: deleteRedisValueParamsProps) => {
	return Axios.json(URL.deleteRedisValue, params, {}, 'DELETE');
};
// *--------------------------------------------------
// * mysql & pgsql 合并接口 可能与上面接口存在重复
export const getAllDatabase: (
	params: AllSendDataParamsProps
) => Promise<getPgDatabaseRes | GetDatabasesRes> = (
	params: AllSendDataParamsProps
) => {
	return Axios.get(URL.getAllDatabases, params);
};
export const deleteAllDatabase: (
	params: deleteAllDatabaseProps
) => Promise<resProps> = (params: deleteAllDatabaseProps) => {
	return Axios.delete(URL.deleteAllDatabases, params);
};

export const getUsers: (
	params: getAllUserParamsProps
) => Promise<getMysqlUserResProps | getPgsqlUserResProps> = (
	params: getAllUserParamsProps
) => {
	return Axios.get(URL.getUsers, params);
};
export const deleteUsers: (params: deleteUserParamsProps) => Promise<resProps> =
	(params: deleteUserParamsProps) => {
		return Axios.delete(URL.deleteUser, params);
	};
export const createUsers: (
	params: mysqlCreateUserParamsProps | pgsqlCreateUserParamsProps
) => Promise<resProps> = (
	params: mysqlCreateUserParamsProps | pgsqlCreateUserParamsProps
) => {
	return Axios.json(URL.createUser, params);
};
export const getUserAuth: (
	params: getUserAuthParamsProps
) => Promise<PgsqlUserAuthRes | MysqlUserAuthRes> = (
	params: getUserAuthParamsProps
) => {
	return Axios.get(URL.getUserAuth, params);
};
export const cancelAuth: (params: cancelAuthParamsProps) => Promise<resProps> =
	(params: cancelAuthParamsProps) => {
		return Axios.json(URL.cancelAuth, params, {}, 'DELETE');
	};
export const getExecuteHistory: (
	params: getExecuteHistoryParamsProps
) => Promise<getExecuteHistoryRes> = (params: getExecuteHistoryParamsProps) => {
	console.log(params);
	return Axios.json(URL.getExecuteHistory, params, {}, 'POST');
};
export const sqlAudit = (params: SqlAuditParamsProps) => {
	return Axios.json(URL.sqlAudit, params, {}, 'POST');
};
