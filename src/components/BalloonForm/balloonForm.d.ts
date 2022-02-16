export interface balloonFormProps {
    trigger: any,
    formProps: any,
    onConfirm: (value: any) => any,
    onCancel: () => void,
    visible: boolean,
    okText: string,
    cancelText: string,
    children: any,
}