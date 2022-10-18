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
export interface AddDatabaseProps {
	open: boolean;
	onCancel: () => void;
}
export interface AddPgDatabaseProps {
	open: boolean;
	onCancel: () => void;
}
export interface MysqlEditTableProps {
	isEdit?: boolean;
}

export interface MysqlTableInfoProps {
	isEdit: boolean;
	handleChange: (values: any) => void;
}
export interface MysqlColInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}

export interface MysqlIndexInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface MysqlForeignKeyInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}
declare global {
	interface Window {
		sqlFormatter: any;
	}
}
