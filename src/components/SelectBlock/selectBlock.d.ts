export interface SelectBlockProps {
	options: any[];
	currentValue: string | number;
	onCallBack: (value: any) => void;
	disabled?: boolean;
}
