import { menuReduxProps } from '@/redux/menu/menu';
import { globalVarProps } from '@/types/index';
export interface middlewareProps {
	chartName: string;
	chartVersion: string;
	createTime: string | null;
	description: string;
	grafanaId: null;
	id: number;
	image: string | null;
	imagePath: string | null;
	middlewares: null;
	name: string;
	official: true;
	replicas: null;
	replicasStatus: null;
	status: number;
	type: string | null;
	version: string;
	versionStatus: null;
}
export interface middlewareItemProps extends middlewareProps {
	clusterId: string;
	onRefresh: () => void;
	menu: menuReduxProps;
	setMenuRefresh: (flag: boolean) => void;
}
export interface middlewareListProps {
	[propsName: string]: middlewareProps[];
}
export interface middlewareRepositoryProps {
	globalVar: globalVarProps;
}
export interface paramsProps {
	type: string;
}
