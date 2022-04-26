export interface SendMenuItem {
	aliasName: string;
	available: null;
	iconName: string;
	id: number;
	module: null | string;
	name: string;
	own: boolean;
	parentId: number;
	subMenu: null | SendMenuItem[];
	url: string;
	weight: number;
}
