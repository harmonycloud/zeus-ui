export interface ServiceIngressProps {
	globalVar: globalVarProps;
}
export interface ServiceIngressItem {
	clusterId: string;
	exposeType: string;
	middlewareName: string | null;
	middlewareNickName: string | null;
	middlewareType: string;
	protocol: string;
	ingressComponentDtoList: any[];
	[propsName: string]: any;
}
