export interface ParamsProps {
	currentTab: string;
	type: string;
	name: string;
}
export interface RoleDetailParamsProps extends ParamsProps {
	userName: string;
}
export interface AddAccountProps {
	open: boolean;
	onCancel: () => void;
}
