import * as React from 'react';
import { useState, useEffect } from 'react';
import {
	Tree,
	Dialog,
	Message,
	Checkbox,
	Loading
} from '@alicloud/console-components';
import { roleProps, roleTree } from './role';
import messageConfig from '@/components/messageConfig';
import { updateRole } from '@/services/role';
import { getClusters } from '@/services/common';

const { Group: CheckboxGroup } = Checkbox;
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
	console.log(data);
	const [treeData, setTreeData] = useState<treeData[] | undefined>();
	const [checkedKeys, setCheckedKeys] = useState<any | undefined[]>([]);
	const [harfCheckedKeys, setHarfCheckedKeys] = useState<any | undefined[]>(
		[]
	);
	const [originData, setOriginData] = useState([]);
	const [clusterList, setClusterList] = useState([]);
	const [clusters, setClusters] = useState<string[]>([]);
	const [namespaceList, setNamespaceList] = useState({});
	const [namespaces, setNamespaces] = useState<string[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

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
					label: item.aliasName,
					own: item.own ? 1 : 0
				};
			} else {
				const children = item.children?.map((str: roleTree) => {
					return {
						key: String(str.id),
						label: str.aliasName,
						own: str.own ? 1 : 0
					};
				});
				const newChildren = filterArray(children);
				return {
					key: String(item.id),
					label: item.aliasName,
					children: newChildren
				};
			}
		});
		setTreeData(menuTree);
		menuTree &&
			menuTree.map((item) => {
				if (
					item.children &&
					item.children.every((str: any) => str.own)
				) {
					defaultCheckedKeys && defaultCheckedKeys.push(item.key);
				}
			});
		setCheckedKeys(defaultCheckedKeys);
	}, []);
	useEffect(() => {
		getClusters({ detail: true }).then((res) => {
			if (res.success) {
				setLoading(false);
				if (res.data.length !== 0) {
					setOriginData(res.data);
					const listTemp = res.data.map((item: any) => {
						return {
							value: `${item.id}/${item.name}`,
							label: item.name
						};
					});
					setClusterList(listTemp);
				} else {
					setOriginData([]);
					setClusterList([]);
					setNamespaceList({});
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	useEffect(() => {
		if (data?.clusterList) {
			const clustersTemp = data.clusterList.map(
				(item: any) => `${item.id}/${item.name}`
			);
			setClusters(clustersTemp);
			const namespacesTemp: string[] = [];
			data.clusterList.map((item: any) => {
				item.namespaceList.map((i: any) => {
					namespacesTemp.push(`${i.name}/${item.name}`);
				});
			});
			setNamespaces(namespacesTemp);
		}
	}, [originData]);
	useEffect(() => {
		if (originData.length > 0) {
			const obj = {};
			clusters.map((item) => {
				const [clusterId, clusterName] = item.split('/');
				const current: any = originData.find(
					(o: any) => clusterId === o.id
				);
				obj[current.name] = current.namespaceList;
			});
			setNamespaceList(obj);
		}
	}, [clusters]);
	const filterArray = (arr: any[] | undefined) => {
		const temp: any[] = [];
		arr &&
			arr.forEach(function (a) {
				const check = temp.every(function (b) {
					return a.key !== b.key;
				});
				check && temp.push(a);
			});
		return temp;
	};
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
	const handleCheck = (keys: any[], okr: { [propName: string]: any }) => {
		// console.log(keys,okr);
		// keys = keys.concat(okr.indeterminateKeys);
		setCheckedKeys(keys);
		setHarfCheckedKeys(okr.indeterminateKeys);
	};
	const onOk = () => {
		const clusterListTemp = clusters.map((item) => {
			const [clusterId, clusterName] = item.split('/');
			return {
				id: clusterId,
				namespaceList: namespaces
					.filter((i) => {
						const [name, clusterNameTemp] = i.split('/');
						if (clusterNameTemp === clusterName) return i;
					})
					.map((i) => {
						const [name] = i.split('/');
						return {
							name: name
						};
					})
			};
		});
		// console.log(clusterListTemp);
		if (data) {
			const sendData: roleProps = data;
			data.menu &&
				data.menu.map((item) => {
					if (
						checkedKeys.indexOf(String(item.id)) !== -1 ||
						harfCheckedKeys.indexOf(String(item.id)) !== -1
					) {
						item.own = true;
						console.log(item);
					} else {
						item.own = false;
					}
				});
			data.clusterList = clusterListTemp;
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

	const onChange = (selectedItems: string[], type: string) => {
		if (type === 'cluster') {
			setClusters(selectedItems);
		} else {
			setNamespaces(selectedItems);
		}
	};

	return (
		<Dialog
			title="分配角色 & 分区"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			className="role-modal"
			onOk={onOk}
		>
			<p>菜单权限分配：</p>
			<div className="role-management-role-content">
				<Tree
					defaultExpandAll
					checkable
					checkedKeys={checkedKeys}
					onCheck={handleCheck}
					dataSource={treeData}
				/>
			</div>
			<p>资源池权限分配：</p>
			<Loading tip="加载中，请稍后" size="medium" visible={loading}>
				<div className="role-management-content">
					<div className="role-management-cluster">
						<div className="role-management-title">资源池</div>
						<div className="role-management-check-content">
							<CheckboxGroup
								value={clusters}
								dataSource={clusterList}
								onChange={(selectedItems) =>
									onChange(selectedItems, 'cluster')
								}
								direction="ver"
							/>
						</div>
					</div>
					<div className="role-management-namespace">
						<div className="role-management-title">资源分区</div>
						<div className="role-management-check-content">
							<CheckboxGroup
								value={namespaces}
								onChange={(selectedItems) =>
									onChange(selectedItems, 'namespace')
								}
							>
								{Object.keys(namespaceList).map((key) => {
									return (
										<div key={key}>
											<div className="role-management-label">
												{key}:
											</div>
											<div className="role-management-checkout-content">
												{namespaceList[key].map(
													(namespace: any) => {
														return (
															<Checkbox
																key={
																	namespace.name
																}
																value={`${namespace.name}/${key}`}
															>
																{namespace.aliasName ||
																	namespace.name}
															</Checkbox>
														);
													}
												)}
											</div>
										</div>
									);
								})}
							</CheckboxGroup>
						</div>
					</div>
				</div>
			</Loading>
		</Dialog>
	);
}

export default RolePermissions;
function str(str: any) {
	throw new Error('Function not implemented.');
}
