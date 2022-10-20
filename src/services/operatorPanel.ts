import Axios from './request.js';
import * as URL from './operatorPanel.constants';
import { AuthLoginRes, GetDatabasesRes } from '@/pages/OperationPanel/index.d';
import { resProps } from '@/types/comment';
interface ParamsProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
}
interface updateParamsProps extends ParamsProps {
	db: string;
	character: string;
	collate: string;
}
interface deleteParamsProps extends ParamsProps {
	database: string;
}
interface getCollationParamsProps extends ParamsProps {
	charset: string;
}
interface charSetResProps extends resProps {
	data: string[];
}
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
export const getDatabases: (params: ParamsProps) => Promise<GetDatabasesRes> = (
	params: ParamsProps
) => {
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
export const getCharset: (params: ParamsProps) => Promise<charSetResProps> = (
	params: ParamsProps
) => {
	return Axios.get(URL.getCharset, params);
};
export const getCollation: (
	params: getCollationParamsProps
) => Promise<charSetResProps> = (params: getCollationParamsProps) => {
	return Axios.get(URL.getCollation, params);
};
