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
export interface PgsqlEditTableProps {
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
export interface PgsqlTableInfoProps {
	isEdit: boolean;
	handleChange: (values: any) => void;
}
export interface PgsqlColInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgForeignKeyInfoProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgExclusivenessProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgUniquenessProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgExamineProps {
	originData: any[];
	handleChange: (values: any) => void;
}
export interface PgInheritProps {
	isEdit: boolean;
	handleChange: (values: any) => void;
}
declare global {
	interface Window {
		sqlFormatter: any;
	}
}
