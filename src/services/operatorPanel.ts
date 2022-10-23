import Axios from './request.js';
import * as URL from './operatorPanel.constants';
import {
	AllSendDataParamsProps,
	AuthLoginRes,
	cancelAuthParamsProps,
	charSetResProps,
	createPgDatabaseParamsProps,
	createSchemaParamsProps,
	deleteAllDatabaseProps,
	deleteParamsProps,
	deletePgTableParamsProps,
	deleteSchemaParamsProps,
	deleteUserParamsProps,
	enableMysqlUserParamsProps,
	enablePgsqlUserParamsProps,
	getAllUserParamsProps,
	getCollationParamsProps,
	getColParamsProps,
	getColsResProps,
	GetDatabasesRes,
	GetEncodingRes,
	getIndexRes,
	getMysqlUserResProps,
	getPgColParamsProps,
	getPgColRes,
	getPgDatabaseRes,
	getPgsqlTableRes,
	getPgsqlUserResProps,
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
	PgsqlUserAuthRes,
	PgsqslDatabaseItem,
	resetPasswordParamsProps,
	SendDataParamsProps,
	updateParamsProps
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
	return Axios.post(URL.AuthLogin, params);
};
export const getDatabases: (
	params: SendDataParamsProps
) => Promise<GetDatabasesRes> = (params: SendDataParamsProps) => {
	return Axios.get(URL.getDatabases, params);
};
export const createDatabase: (
	params: updateParamsProps
) => Promise<resProps> = (params: updateParamsProps) => {
	return Axios.json(URL.updateDb, params, {}, 'POST');
};
export const updateDatabase: (
	params: updateParamsProps
) => Promise<resProps> = (params: updateParamsProps) => {
	return Axios.json(URL.updateDb, params, {}, 'PUT');
};
export const deleteDatabase: (
	params: deleteParamsProps
) => Promise<resProps> = (params: deleteParamsProps) => {
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
export const getCols: (
	params: getColParamsProps
) => Promise<getColsResProps> = (params: getColParamsProps) => {
	return Axios.get(URL.getCols, params);
};
export const gerIndexs: (params: getColParamsProps) => Promise<getIndexRes> = (
	params: getColParamsProps
) => {
	return Axios.get(URL.gerIndexs, params);
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
export const deletePgTables: (
	params: deletePgTableParamsProps
) => Promise<resProps> = (params: deletePgTableParamsProps) => {
	return Axios.delete(URL.deletePgTable, params);
};
export const getPgCols: (
	params: getPgColParamsProps
) => Promise<getPgColRes> = (params: getPgColParamsProps) => {
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
export const deleteUsers: (
	params: deleteUserParamsProps
) => Promise<resProps> = (params: deleteUserParamsProps) => {
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
export const cancelAuth: (
	params: cancelAuthParamsProps
) => Promise<resProps> = (params: cancelAuthParamsProps) => {
	return Axios.json(URL.cancelAuth, params, {}, 'DELETE');
};
