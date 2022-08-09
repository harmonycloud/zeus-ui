export interface ActiveCardProps {
	title: string;
	status: number;
	areaNumber: number;
	isActive: boolean;
}
// 可用域相关接口

export interface ResourceZones {
	zoneA: ZonesItem | null;
	zoneB: ZonesItem | null;
	zoneC: ZonesItem | null;
}
type nullOrNumber = null | number;
export interface ZonesItem {
	aliasName: string;
	clusterId: null | string;
	cpuRate: nullOrNumber;
	cpuTotal: nullOrNumber;
	cpuUsed: nullOrNumber;
	errorNodeCount: nullOrNumber;
	init: null | boolean;
	memoryRate: nullOrNumber;
	memoryTotal: nullOrNumber;
	memoryUsed: nullOrNumber;
	name: string;
	node: null | number;
	nodeList: null | NodeItem[];
	runningNodeCount: nullOrNumber;
}
export interface ResourceItem {
	allocated: string;
	total: string;
	used: string;
}
export interface TaintItem {
	effect: string;
	key: string;
	timeAdded: string;
	value: string;
}
export interface NodeItem {
	aliasName: string;
	clusterId: string;
	clusterIp: string;
	cpu: ResourceItem;
	createTime: string;
	disk: ResourceItem;
	gpu: ResourceItem;
	ip: string;
	labels: {
		[propsName: string]: string;
	};
	memory: ResourceItem;
	name: string;
	netSegment: string;
	nodePool: string;
	scheduable: boolean;
	status: string;
	taints: TaintItem[];
	time: string;
	type: string;
	selected?: boolean;
}
export interface UsableNodeItem {
	clusterId: string;
	cpuRate: number | null;
	cpuTotal: number | null;
	cpuUsed: number | null;
	createTime: string;
	ip: string;
	memoryRate: number | null;
	memoryTotal: number | null;
	memoryUsed: number | null;
	nodeName: string;
	status: string;
}
