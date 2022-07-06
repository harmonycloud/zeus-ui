export interface TableRadioProps {
	id: string;
	isMysql?: boolean;
	onCallBack: (value: string | number | boolean) => void;
	dataList?: dataItem[];
}
export interface dataItem {
	id: string;
	cpu: string;
	memory: string;
}
