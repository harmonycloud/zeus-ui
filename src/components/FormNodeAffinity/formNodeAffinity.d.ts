import { CustomFormItemProps } from '@/types/comment';
import { clusterType, namespaceType } from '@/types/index';

export interface FormNodeAffinityProps extends CustomFormItemProps {
	cluster: clusterType;
	namespace: namespaceType;
	field: any;
}
export interface NodeAffinityLabelItem {
	label: string;
	id: number;
}

export interface NodeAffinityProps {
	nodeAffinity: boolean;
	nodeAffinityLabel: string;
	nodeAffinityForce: boolean;
}