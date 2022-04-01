import React, { useEffect, useState } from 'react';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Table from '@alicloud/console-components-table';
import { Checkbox } from '@alicloud/console-components';
import storage from '@/utils/storage';
import { AllotRoleItem } from './role';

const { Group: CheckboxGroup } = Checkbox;
export default function AllotRole(): JSX.Element {
	const [dataSource, setDataSource] = useState<AllotRoleItem[]>([]);
	const [allChecked, setAllChecked] = useState<boolean>(false);

	useEffect(() => {
		const power = JSON.parse(storage.getSession('rolePower'));
		const keys = Object.keys(power);
		const list: AllotRoleItem[] = [];
		keys.forEach((item: string) => {
			const v = power[item].split('');
			const vl: string[] = [];
			if (v[0] === '1') vl.push('get');
			if (v[1] === '1') vl.push('operate', 'get');
			if (v[2] === '1') vl.push('create', 'get');
			if (v[3] === '1') vl.push('delete', 'get');
			if (power[item] === '1111')
				vl.push('all', 'get', 'operate', 'create', 'delete');
			const vt = Array.from(new Set(vl));
			list.push({
				name: item,
				roles: vt
			});
		});
		setDataSource(list);
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
		const lt = Array.from(new Set(list));
		record.roles = lt;
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
	return (
		<Page>
			<Header
				title="分配角色权限"
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Table dataSource={dataSource}>
					<Table.Column title="中间件名称" dataIndex="name" />
					<Table.Column
						title={roleNameRender}
						dataIndex="roles"
						cell={roleRender}
					/>
				</Table>
			</Content>
		</Page>
	);
}
