export interface TableRadioProps {
	id: string;
	isMysql?: boolean;
	onCallBack: (value: string | number | boolean) => void;
}
