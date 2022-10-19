import { resProps } from '@/types/comment';
export interface ParamsProps {
	currentTab: string;
	type: string;
	name: string;
	projectId: string;
	clusterId: string;
	namespace: string;
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
export interface consoleUser {
	username: string;
	mwToken: string;
}
export interface LoginConsoleProps {
	open: boolean;
	onCancel: () => void;
	currentUser: consoleUser | undefined;
	projectId: string;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	middlewareType: string;
}
export interface OperatorHeaderProps {
	currentUser: consoleUser | undefined;
	loginOut: () => void;
}
export interface SqlConsoleProps {
	currentUser: consoleUser | undefined;
	setOpen: (value: boolean) => void;
}
declare global {
	interface Window {
		sqlFormatter: any;
	}
}

export interface AuthLoginRes extends resProps {
	mwToken: string;
}
