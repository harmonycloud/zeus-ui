import React from 'react';
import { Dialog, Message } from '@alicloud/console-components';
import { connect } from 'react-redux';
import { deleteCluster } from '@/services/common';
import { setRefreshCluster } from '@/redux/globalVar/var';
import messageConfig from '@/components/messageConfig';

interface deleteCardProps {
	visible: boolean;
	onCancel: () => void;
	id: string;
	setRefreshCluster: (flag: boolean) => void;
	updateFn: () => void;
}
function DeleteCard(props: deleteCardProps): JSX.Element {
	const { visible, onCancel, id, setRefreshCluster, updateFn } = props;
	const onOk = () => {
		deleteCluster({ clusterId: id }).then((res) => {
			if (res.success) {
				Message.show(
					messageConfig('success', '成功', {
						data: '删除成功'
					})
				);
				setRefreshCluster(true);
				updateFn();
				onCancel();
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	return (
		<Dialog
			title="操作提醒"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
		>
			确认删除该集群？
		</Dialog>
	);
}
export default connect(() => ({}), {
	setRefreshCluster
})(DeleteCard);
