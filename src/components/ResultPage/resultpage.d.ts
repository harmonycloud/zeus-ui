export interface SuccessPageProps {
	title: string;
	leftText?: string;
	rightText?: string;
	leftHandle?: () => void;
	rightHandle?: () => void;
	rightBtn?: boolean;
	leftBtn?: boolean;
	children?: any;
}
export interface LoadingPageProps {
	title: string;
	btnText: string;
	btnHandle: () => void;
}
export interface ErrorPageProps {
	title: string;
	btnText: string;
	btnHandle: () => void;
}
