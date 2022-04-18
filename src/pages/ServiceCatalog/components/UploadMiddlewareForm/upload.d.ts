import { globalVarProps } from '@/types/index';
export interface UploadMiddlewareFormProps {
	visible: boolean;
	onCancel: () => void;
	globalVar: globalVarProps;
	onCreate: () => void;
}
