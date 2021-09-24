import * as React from 'react';
import { useState, useEffect } from 'react';
import { Tree, Dialog, Message } from '@alicloud/console-components';
import { roleProps, roleTree } from './role';
import messageConfig from '@/components/messageConfig';
import { updateRole } from '@/services/role';

interface RolePermissionProps {
	visible: true;
	onCreate: () => void;
	onCancel: () => void;
	data: roleProps | null | undefined;
}
interface treeData {
	key: string;
	label: string;
	children?: any[] | null | undefined;
}
function RolePermissions(props: RolePermissionProps): JSX.Element {
	const { onCancel, onCreate, visible, data } = props;
	const [treeData, setTreeData] = useState<treeData[] | undefined>();
	const [checkedKeys, setCheckedKeys] = useState<any | undefined[]>([]);

	useEffect(() => {
		const menu: roleTree[] | undefined = data?.menu;
		let menuTree = changeTree(menu);
		let defaultCheckedKeys = menu?.map((item) => {
			if (item.own) return String(item.id);
		});
		defaultCheckedKeys = defaultCheckedKeys?.filter((item) => item);
		menuTree = menuTree?.map((item) => {
			if (!item.children) {
				return {
					key: String(item.id),
					label: item.aliasName
				};
			} else {
				const children = item.children?.map((str: roleTree) => {
					return {
						key: String(str.id),
						label: str.aliasName
					};
				});
				return {
					key: String(item.id),
					label: item.aliasName,
					children
				};
			}
		});
		setTreeData(menuTree);
		console.log(defaultCheckedKeys);

		setCheckedKeys(defaultCheckedKeys);
	}, []);
	const changeTree = (data: any[] | undefined) => {
		data &&
			data.forEach((item) => {
				const parentId = item.parentId;
				if (parentId !== 0) {
					data.forEach((ele) => {
						if (ele.id === parentId) {
							let childArray = ele.children;
							if (!childArray) {
								childArray = [];
							}
							childArray.push(item);
							ele.children = childArray;
						}
					});
				}
			});

		return data?.filter((item) => item.parentId === 0);
	};
	const handleCheck = (keys: any[]) => {
		setCheckedKeys(keys);
	};
	const onOk = () => {
		// console.log(checkedKeys);
		if (data) {
			const sendData: roleProps = data;
			data.menu &&
				data.menu.map((item) => {
					if (checkedKeys.indexOf(String(item.id)) !== -1) {
						item.own = true;
					} else {
						item.own = false;
					}
				});
			delete sendData.createTime;
			sendData.roleId = sendData.id;
			updateRole(sendData).then((res) => {
				console.log(res);
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '用户修改成功')
					);
					onCreate();
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	};

	return (
		<Dialog
			title="分配角色权限"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			className="role-modal"
			onOk={onOk}
		>
			<Tree
				defaultExpandAll
				checkable
				checkStrictly={true}
				checkedKeys={checkedKeys}
				onCheck={handleCheck}
				dataSource={treeData}
			/>
		</Dialog>
	);
}

export default RolePermissions;
