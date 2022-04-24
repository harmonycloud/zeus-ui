import { resProps } from '@/types/comment';
export interface userProps {
	userName: string;
	createTime?: string | null;
	email: string | null;
	password?: string | null;
	phone: string | null;
	roleId: number | null;
	roleName?: string;
	aliasName: string | null;
	[propsName: string]: any;
}
export interface roleProps {
	value: any;
	label: string;
	description: string;
	id: number;
	name: string;
	status: string | null;
}
export interface usersProps extends resProps {
	data: userProps[];
}
export interface updateProps extends resProps {
	data: userProps;
}
export interface deleteProps extends resProps {
	data: boolean;
}
export interface rolesProps extends resProps {
	data: roleProps[];
}
export interface sendDataParams {
	userName: string;
	aliasName: string;
	phone: string;
	email: null | string;
	isAdmin: boolean;
}
