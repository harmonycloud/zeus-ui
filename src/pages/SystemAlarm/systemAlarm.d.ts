import { globalVarProps } from '@/types/index';

export interface systemAlarmProps {
	globalVar: globalVarProps;
}

export interface alarmRecordProps {
	middlewareName?: string | undefined;
	clusterId: string | undefined;
	namespace?: string | undefined;
	type?: string | undefined;
	customMid?: boolean | undefined;
	capabilities?: any;
	monitor: any;
	alarmType?: string | undefined;
}
