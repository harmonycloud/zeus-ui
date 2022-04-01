import React, { useEffect, useState } from 'react';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { useHistory } from 'react-router';
import Table from '@alicloud/console-components-table';
import { getMiddlewareRepository } from '@/services/repository';
import { updateRole } from '@/services/role';
import { Checkbox, Message, Button } from '@alicloud/console-components';
import storage from '@/utils/storage';
import { AllotRoleItem, Power } from './role';
import messageConfig from '@/components/messageConfig';
import './index.scss';

const { Group: CheckboxGroup } = Checkbox;
export default function AllotRole(): JSX.Element {
	const [dataSource, setDataSource] = useState<AllotRoleItem[]>([]);
	const [allChecked, setAllChecked] = useState<boolean>(false);
	const history = useHistory();

	useEffect(() => {
		const role = JSON.parse(storage.getSession('rolePower'));
		getMiddlewareRepository().then((res) => {
			console.log(res);
			if (res.success) {
				const keys = Object.keys(role.power);
				// const list = [];
				let list: AllotRoleItem[] = res.data.map((item: any) => {
					return {
						aliasName: item.name,
						name: item.chartName,
						roles: []
					};
				});
				keys.forEach((item: string) => {
					const v = role.power[item].split('');
					const vl: string[] = [];
					if (v[0] === '1') vl.push('get');
					if (v[1] === '1') vl.push('operate', 'get');
					if (v[2] === '1') vl.push('create', 'get');
					if (v[3] === '1') vl.push('delete', 'get');
					if (role.power[item] === '1111')
						vl.push('all', 'get', 'operate', 'create', 'delete');
					const vt = Array.from(new Set(vl));
					list = list.map((i) => {
						if (i.name === item) {
							i.roles = vt;
						}
						return i;
					});
				});
				setDataSource(list);
			} else {
				setDataSource([]);
				Message.show(messageConfig('error', '失败', res));
			}
		});
		return () => {
			storage.removeSession('rolePower');
		};
	}, []);

	const roleNameRender = () => {
		return (
			<Checkbox
				checked={allChecked}
				onChange={(checked: boolean) => {
					setAllChecked(checked);
					if (checked) {
						const list = dataSource.map((item: AllotRoleItem) => {
							item.roles = [
								'all',
								'get',
								'operate',
								'create',
								'delete'
							];
							return item;
						});
						setDataSource(list);
					} else {
						const list = dataSource.map((item: AllotRoleItem) => {
							item.roles = [];
							return item;
						});
						setDataSource(list);
					}
				}}
				label="权限名称"
			/>
		);
	};
	const onChange = (value: string[], record: AllotRoleItem) => {
		let list: string[] = value;
		if (value.includes('all')) {
			list = ['all', 'get', 'operate', 'create', 'delete'];
		}
		if (!value.includes('all') && record.roles.includes('all')) {
			list = [];
		}
		if (value.includes('get') && !record.roles.includes('all')) {
			list.push('get');
		}
		if (value.includes('operate') && !record.roles.includes('all')) {
			list.push('get', 'operate');
		}
		if (value.includes('create') && !record.roles.includes('all')) {
			list.push('get', 'create');
		}
		if (value.includes('delete') && !record.roles.includes('all')) {
			list.push('get', 'delete');
		}
		if (!value.includes('operate') && record.roles.includes('operate')) {
			list = list.filter(
				(item: string) => item !== 'all' && item !== 'operate'
			);
		}
		if (!value.includes('create') && record.roles.includes('create')) {
			list = list.filter(
				(item: string) => item !== 'all' && item !== 'create'
			);
		}
		if (!value.includes('delete') && record.roles.includes('delete')) {
			list = list.filter(
				(item: string) => item !== 'all' && item !== 'delete'
			);
		}
		const lt = Array.from(new Set(list));
		record.roles = lt;
		if (
			dataSource.every((item: AllotRoleItem) => item.roles.length === 5)
		) {
			setAllChecked(true);
		} else {
			setAllChecked(false);
		}
		setDataSource([...dataSource]);
	};
	const roleRender = (
		value: string,
		index: number,
		record: AllotRoleItem
	) => {
		return (
			<CheckboxGroup
				value={value}
				onChange={(value: string[]) => onChange(value, record)}
			>
				<Checkbox id="all" value="all">
					全选
				</Checkbox>
				<Checkbox
					id="get"
					value="get"
					disabled={
						value.includes('operate') ||
						value.includes('create') ||
						value.includes('delete')
					}
				>
					查看
				</Checkbox>
				<Checkbox id="operate" value="operate">
					运维
				</Checkbox>
				<Checkbox id="create" value="create">
					创建
				</Checkbox>
				<Checkbox id="delete" value="delete">
					删除
				</Checkbox>
			</CheckboxGroup>
		);
	};
	const handleSummit = () => {
		console.log(dataSource);
		const role = JSON.parse(storage.getSession('rolePower'));
		const obj: Power = {};
		dataSource.forEach((item: AllotRoleItem) => {
			let r: string[] = [];
			if (item.roles.includes('all')) {
				r = ['1', '1', '1', '1'];
			} else {
				if (item.roles.includes('get')) {
					r.push('1');
				} else {
					r.push('0');
				}
				if (item.roles.includes('operate')) {
					r.push('1');
				} else {
					r.push('0');
				}
				if (item.roles.includes('create')) {
					r.push('1');
				} else {
					r.push('0');
				}
				if (item.roles.includes('delete')) {
					r.push('1');
				} else {
					r.push('0');
				}
			}
			obj[item.name] = r.join('');
		});
		const sendData = {
			roleId: role.id,
			id: role.id,
			name: role.name,
			description: role.description,
			power: obj
		};
		updateRole(sendData).then((res) => {
			if (res.success) {
				Message.show(
					messageConfig('success', '成功', '角色权限修改成功')
				);
				history.push('/systemManagement/roleManagement');
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	return (
		<Page>
			<Header
				title="分配角色权限"
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Table dataSource={dataSource}>
					<Table.Column title="中间件名称" dataIndex="aliasName" />
					<Table.Column
						title={roleNameRender}
						dataIndex="roles"
						cell={roleRender}
					/>
				</Table>
				<div className="zeus-allot-role-btn-content">
					<Button onClick={handleSummit} type="primary">
						确定
					</Button>
					<Button
						onClick={() => {
							history.push(`/systemManagement/roleManagement`);
						}}
					>
						取消
					</Button>
				</div>
			</Content>
		</Page>
	);
}
