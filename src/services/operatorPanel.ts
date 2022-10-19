import Axios from './request.js';
import * as URL from './operatorPanel.constants';
import { AuthLoginRes } from '@/pages/OperationPanel/index.d';

export const authLogin: (params: {
	clusterId: string;
	middlewareName: string;
	username: string;
	password: string;
	type: string;
}) => Promise<AuthLoginRes> = (params: {
	clusterId: string;
	middlewareName: string;
	username: string;
	password: string;
	type: string;
}) => {
	const result = Axios.get(URL.AuthLogin, params);
	return result;
};
