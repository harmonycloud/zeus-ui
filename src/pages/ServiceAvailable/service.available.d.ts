export interface serviceAvailableItemProps {
	clusterId: string;
	clusterNickname: string | null;
	createTime: string;
	exposeIP: string;
	exposePort: string;
	exposeType: string;
	httpExposePort: string | null;
	isDisasterRecovery: boolean | null;
	middlewareName: string;
	middlewareNickName: string | null;
	middlewareType: string;
	name: string;
	namespace: string;
	namespaceNickname: string | null;
	protocol: string;
	rules: any | null;
	serviceList: any[];
	servicePort: string;
	imagePath?: string | null;
	ingressClassName: string | null;
	ingressPodList: any[] | null;
	servicePurpose: string | null;
	networkModel: 4 | 7;
	address: string | null;
}
export interface serviceAvailablesProps {
	chartName: string;
	chartVersion: string;
	image: string | null;
	imagePath: string | null;
	ingressList: serviceAvailableProps[];
	name: string;
	serviceNum: number;
	version: string;
}
export interface httpListProps {
	serviceName: string;
	servicePort: string;
	domain: string;
	path: string;
}
