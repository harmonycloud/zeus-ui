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
	aliasName?: string;
	clusterId: string;
	cpuRate: number;
	cpuRequest?: number;
	memoryRate: number;
	memoryRequest?: number;
	name: string;
	namespace?: string;
	per5MinCpu: number;
	per5MinMemory: number;
	requestCpu?: number;
	requestMemory?: number;
	type?: string;
}
