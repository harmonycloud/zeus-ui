import { CustomFormItemProps } from '@/types/comment';
import { clusterType, namespaceType } from '@/types/index';

export interface FormStorageClassProps extends CustomFormItemProps {
	cluster: clusterType;
	namespace: namespaceType;
}
