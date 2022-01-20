export interface aclEditProps {
	visible: boolean;
	onCancel: (value: boolean) => void;
	data: any;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	chartName: string;
	chartVersion: string;
}
export interface UserInfoProps {
	data: any;
}
