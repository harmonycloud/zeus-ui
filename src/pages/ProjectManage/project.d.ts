export interface EditProjectFormProps {
	visible: boolean;
	onCreate: () => void;
	onCancel: () => void;
	projectId?: string;
}
