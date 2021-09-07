import { filterProps } from './constant';
export const states: filterProps[] = [
	{ value: 'Creating', label: '启动中' },
	{ value: 'Running', label: '运行正常' },
	{ value: 'Other', label: '运行异常' }
];
export const exposedWay: filterProps[] = [
	{ value: 'Ingress', label: 'Ingress' },
	{ value: 'NodePort', label: 'NodePort' }
];
