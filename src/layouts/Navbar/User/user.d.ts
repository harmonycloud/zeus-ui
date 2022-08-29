import { globalVarProps } from '@/types';

export interface userProps {
	nickName: string;
	className: string;
	role: any;
	globalVar: globalVarProps;
	setAvatar: (avatar: boolean) => void;
}
