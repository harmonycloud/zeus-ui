export interface FormProps {
	visible: boolean;
	onCreate: () => void;
	onCancel: () => void;
	data: any | undefined | null;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	charsetList?: any;
}
export interface ManageProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
}
