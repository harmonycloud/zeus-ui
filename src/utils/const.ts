import { filtersProps } from '@/types/comment';
export const states: filtersProps[] = [
	{ value: 'Creating', label: '启动中' },
	{ value: 'Running', label: '运行正常' },
	{ value: 'Other', label: '运行异常' }
];
export const exposedWay: filtersProps[] = [
	{ value: 'Ingress', label: 'Ingress' },
	{ value: 'NodePort', label: 'NodePort' }
];
