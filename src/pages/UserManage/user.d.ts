import { resProps } from '@/utils/comment';

export interface userProps {
	userName: string;
	createTime?: string | null;
	email: string | null;
	password?: string | null;
	phone: string | null;
	roleId: number;
	roleName?: string;
	aliasName: string;
	[propsName: string]: any;
}
export interface roleProps {
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
