import React, { useState } from 'react';
import { Dialog, Message, Button } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import MidTable from '@/components/MidTable/index';
import AccessIngressForm from './accessIngress';

interface IngressFormProps {
	visible: boolean;
	onCancel: () => void;
}
const IngressForm = (props: IngressFormProps) => {
	const { visible, onCancel } = props;
	const [dataSource, setDataSource] = useState([]);
	const [primaryKeys, setPrimaryKeys] = useState([]);
	const [active, setActive] = useState<boolean>(false);
	const onOk = () => {
		console.log('ok');
	};
	const Operation = {
		primary: (
			<Button onClick={() => setActive(true)} type="primary">
				接入
			</Button>
		)
	};
	const onChange = (selectedRowKeys: any) => {
		setPrimaryKeys(selectedRowKeys);
	};
	const actionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				<LinkButton>删除</LinkButton>
			</Actions>
		);
	};
	return (
		<Dialog
			title="服务暴露接入"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: 1040 }}
			footerAlign="right"
		>
			<MidTable
				dataSource={dataSource}
				exact
				operation={Operation}
				rowSelection={{
					onChange,
					selectedRowKeys: primaryKeys
				}}
				showJump={false}
			>
				<MidTable.Column title="服务暴露名称" dataIndex="ingressName" />
				<MidTable.Column
					title="服务暴露地址"
					dataIndex="ingressAddress"
				/>
				<MidTable.Column
					title="configMap分区"
					dataIndex="configNamespace"
				/>
				<MidTable.Column
					title="configMap名称"
					dataIndex="configMapName"
				/>
				<MidTable.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
				/>
			</MidTable>
			{active && (
				<AccessIngressForm
					visible={active}
					onCancel={() => setActive(false)}
				/>
			)}
		</Dialog>
	);
};
export default IngressForm;
