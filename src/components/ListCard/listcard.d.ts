export interface ListCardItemProps {
	label?: string | JSX.Element;
	value?: string | JSX.Element;
	width?: number;
	render?: JSX.Element;
}
export interface ListCardProps {
	title: string;
	subTitle: string;
	accordion?: boolean;
	icon: any;
	content?: any;
	children: any;
	actionRender?: any;
}
