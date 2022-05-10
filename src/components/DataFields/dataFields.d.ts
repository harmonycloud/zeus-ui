export interface Item {
	dataIndex?: string;
	label?: string;
	span?: number;
	render?: (value: any) => JSX.Element | string;
}
export interface dataSource {
	[propsName: string]: any;
}
export interface DataFieldsProps {
	items: Item[];
	dataSource: dataSource;
	[propsName: string]: any;
}
