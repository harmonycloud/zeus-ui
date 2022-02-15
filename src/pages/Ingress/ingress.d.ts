
export interface addIngressProps {
	globalVar?: globalVarProps;
    active: boolean;
	entry: string;
	onCreate: (value: ingressCreateProps) => void;
	onCancel: () => void;
	middlewareName: string;
}

export interface selectedInstanceProps {
    name: string;
}

export interface instanceProps{
    name: string;
    type: string;
}

export interface servicesProps{
    serviceName: string;
    portDetailDtoList: any[];
}