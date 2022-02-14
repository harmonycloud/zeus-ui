import { CustomFormItemProps } from '@/types/comment';
import { clusterType, namespaceType } from '@/types/index';

export interface FormTolerationsProps extends CustomFormItemProps {
	cluster: clusterType;
	namespace: namespaceType;
	field: any;
}
export interface TolerationLabelItem {
	label: string;
	id: number;
}

export interface TolerationsProps {
	nodeTolerations: boolean;
	nodeTolerationsLabel: string;
	nodeTolerationsForce: boolean;
}
