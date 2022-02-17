export interface alarmTimeLineProps {
	type: string;
	style: any;
	list: any[];
	clusters?: string[];
	setCluster: (value: string) => void;
	setNamespace: (value: string) => void;
}
