export interface Item {
	dataIndex?: string;
	label?: string;
	render?: (value: any) => JSX.Element;
}
export interface dataSource {
	[propsName: string]: any;
}
export interface DataFieldsProps {
	items: Item[];
	dataSource: dataSource;
	[propsName: string]: any;
}
