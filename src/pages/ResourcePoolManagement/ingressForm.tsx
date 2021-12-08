import React, { useEffect, useState } from 'react';
import { Dialog, Message, Button } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import MidTable from '@/components/MidTable/index';
import AccessIngressForm from './accessIngress';
import InstallIngressForm from './installIngress';
import { getIngresses, deleteIngress } from '@/services/common';
import messageConfig from '@/components/messageConfig';

interface IngressFormProps {
	visible: boolean;
	onCancel: () => void;
	clusterId: string;
}
export interface IngressItemProps {
	address: string;
	clusterId: string;
	configMapName: string;
	defaultServerPort: null | number;
	healthzPort: null | number;
	httpPort: null | number;
	httpsPort: null | number;
	ingressClassName: string;
	namespace: string;
}
interface DataSourceItemProps extends IngressItemProps {
	id?: number;
}
const IngressForm = (props: IngressFormProps) => {
	const { visible, onCancel, clusterId } = props;
	// console.log(clusterId);
	const [dataSource, setDataSource] = useState<DataSourceItemProps[]>([]);
	// const [primaryKeys, setPrimaryKeys] = useState([]);
	const [active, setActive] = useState<boolean>(false);
	const [installActive, setInstallActive] = useState<boolean>(false);
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		getIngresses({ clusterId }).then((res) => {
			if (res.success) {
				// console.log(res);
				const list = res.data.map(
					(item: IngressItemProps, index: number) => {
						const result: DataSourceItemProps = { ...item };
						result.id = index;
						return result;
					}
				);
				// console.log(list);
				setDataSource(list);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const Operation = {
		primary: (
			<>
				<Button onClick={() => setActive(true)} type="primary">
					接入
				</Button>
				<Button onClick={() => setInstallActive(true)}>安装</Button>
			</>
		)
	};
	// const onChange = (selectedRowKeys: any) => {
	// 	console.log(selectedRowKeys);
	// 	setPrimaryKeys(selectedRowKeys);
	// };
	const deleteItem = (record: DataSourceItemProps) => {
		Dialog.show({
			title: '操作确认',
			content: '确认是否删除该服务暴露',
			onOk: () => {
				deleteIngress({
					clusterId,
					ingressName: record.ingressClassName
				}).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								'该服务暴露删除成功'
							)
						);
						getData();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};
	const actionRender = (
		value: string,
		index: number,
		record: DataSourceItemProps
	) => {
		return (
			<Actions>
				<LinkButton onClick={() => deleteItem(record)}>删除</LinkButton>
			</Actions>
		);
	};
	return (
		<Dialog
			title="服务暴露"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onCancel}
			style={{ width: 1040 }}
			footerAlign="right"
		>
			<MidTable
				dataSource={dataSource}
				exact
				operation={Operation}
				// rowSelection={{
				// 	onChange,
				// 	selectedRowKeys: primaryKeys
				// }}
				showJump={false}
			>
				<MidTable.Column
					title="服务暴露名称"
					dataIndex="ingressClassName"
				/>
				<MidTable.Column title="服务暴露地址" dataIndex="address" />
				<MidTable.Column title="configMap分区" dataIndex="namespace" />
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
					onRefresh={getData}
					clusterId={clusterId}
				/>
			)}
			{installActive && (
				<InstallIngressForm
					visible={installActive}
					onCancel={() => setInstallActive(false)}
					onRefresh={getData}
					clusterId={clusterId}
				/>
			)}
		</Dialog>
	);
};
export default IngressForm;
