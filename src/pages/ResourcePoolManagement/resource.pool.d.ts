export interface NodeResourceProps {
	clusterId: string;
	cpuRate: number | null;
	cpuTotal: number | null;
	cpuUsed: number | null;
	createTime: string;
	ip: string;
	memoryRate: number;
	memoryTotal: number;
	memoryUsed: number;
	status: string;
}
export interface MiddlewareResourceProps {
	aliasName: string;
	clusterId: string;
	cpuRate: number;
	memoryRate: number;
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
