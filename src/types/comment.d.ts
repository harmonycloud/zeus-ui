export interface StackTraceElement {
	declaringClass: string;
	methodName: string;
	fileName: string;
	lineNumber: number;
}
export interface resProps {
	code?: number;
	errorMsg?: string | null;
	errorDetail?: string | null;
	success?: boolean;
	count?: number | null;
	errorStack?: StackTraceElement[] | null;
}
export interface filtersProps {
	label: string;
	value: number | string;
	children?: filtersProps[];
}
