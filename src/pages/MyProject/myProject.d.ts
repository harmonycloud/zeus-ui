export interface MyProjectProps {
	setProject: (project: any) => void;
	setRefreshCluster: (flag: boolean) => void;
	setMenuRefresh: (flag: boolean) => void;
	project: ProjectItem;
}
export interface MiddlewareResourceInfo {
	aliasName: string;
	chartVersion: string;
	clusterId: string;
	cpuRate: number;
	imagePath: string;
	memoryRate: string;
	name: string;
	namespace: string;
	per5MinCpu: number;
	per5MinMemory: number;
	per5MinStorage: number;
	requestCpu: number;
	requestMemory: number;
	requestStorage: number;
	storageRate: number;
	type: string;
}
export interface MiddlewareTableItem {
	aliasName: string;
	type: string;
	imagePath: string;
	middlewareResourceInfoList: middlewareResourceInfo[];
}
export interface MiddlewareTableProps {
	data: MiddlewareTableItem;
}
