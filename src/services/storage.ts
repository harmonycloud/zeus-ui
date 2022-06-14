import { resProps } from '@/types/comment.js';
import Axios from './request.js';
import * as Storage from './storage.constants';

export interface GetParams {
	all: boolean;
	clusterId: string;
	key?: string;
	type?: string;
}
interface listRes extends resProps {
	data: any;
}
export const getLists: (params: GetParams) => Promise<listRes> = (
	params: GetParams
) => {
	return Axios.get(Storage.getStorages, params);
};
