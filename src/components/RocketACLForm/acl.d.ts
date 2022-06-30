export interface rocketMQAccount {
	id: number | string;
	accessKey: string;
	admin: boolean;
	whiteRemoteAddress: string;
	secretKey: string;
	groupPerms: {
		[propsName: string]: string;
	};
	topicPerms: {
		[propsName: string]: string;
	};
}
export interface userConfigProps {
	ref?: any;
	name?: string;
	userConfig: rocketMQAccount;
	deleteUserConfigProps: (index: number) => void;
	setUserConfig: (values: rocketMQAccount) => void;
}
export interface authProps {
	id?: number;
	key: string;
	value: string;
}
export interface visibleProps {
	topicsVisible: boolean;
	groupsVisible: boolean;
}
