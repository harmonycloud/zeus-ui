import { CustomFormItemProps } from '@/types/comment';
import { clusterType, namespaceType } from '@/types/index';

export interface FormSwitchProps extends CustomFormItemProps {
	cluster: clusterType;
	namespace: namespaceType;
}
