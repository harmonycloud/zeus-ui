import Axios from './request.js';
import * as URL from './operatorPanel.constants';
import {
	AllSendDataParamsProps,
	AuthLoginRes,
	charSetResProps,
	createSchemaParamsProps,
	deleteParamsProps,
	deleteSchemaParamsProps,
	deleteUserParamsProps,
	getAllUserParamsProps,
	getCollationParamsProps,
	getColParamsProps,
	getColsResProps,
	GetDatabasesRes,
	getMysqlUserResProps,
	getPgDatabaseRes,
	getPgsqlUserResProps,
	getSchemasParamsProps,
	GetSchemasRes,
	getTablesParamsProps,
	getTablesResProps,
	mysqlCreateUserParamsProps,
	pgsqlCreateUserParamsProps,
	PgsqslDatabaseItem,
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
// *--------------------------------------------------
// * mysql & pgsql 合并接口 可能与上面接口存在重复
export const getAllDatabase: (
	params: AllSendDataParamsProps
) => Promise<getPgDatabaseRes | GetDatabasesRes> = (
	params: AllSendDataParamsProps
) => {
	return Axios.get(URL.getAllDatabases, params);
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
