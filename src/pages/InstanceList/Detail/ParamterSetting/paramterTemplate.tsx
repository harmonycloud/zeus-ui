import React, { useEffect, useState } from 'react';
import { Button, Message, Dialog } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { useHistory } from 'react-router';
import Table from '@/components/MidTable';
import { getParamsTemps, deleteParamsTemp } from '@/services/template';
import messageConfig from '@/components/messageConfig';

interface ParamterTemplateProps {
	type: string;
	chartVersion: string;
	middlewareName: string;
}
const ParamterTemplate = (props: ParamterTemplateProps) => {
	const { type, chartVersion, middlewareName } = props;
	const [originData, setOriginData] = useState([]);
	const [dataSource, setDataSource] = useState([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const history = useHistory();
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		setSelectedRowKeys([]);
		getParamsTemps({ type: type }).then((res) => {
			if (res.success) {
				setOriginData(res.data);
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const Operation = {
		primary: (
			<>
				<Button
					onClick={() => {
						history.push(
							`/serviceList/paramterSetting/template/${middlewareName}/${type}/${chartVersion}`
						);
					}}
					type="primary"
				>
					新增
				</Button>
				<Button
					onClick={() => {
						if (selectedRowKeys.length === 0) {
							Message.show(
								messageConfig(
									'error',
									'失败',
									'请选择需要删除模板！'
								)
							);
							return;
						}
						const sendData = {
							type,
							uids: selectedRowKeys.join(',')
						};
						deleteTemp(sendData);
					}}
					type="primary"
				>
					删除
				</Button>
			</>
		)
	};
	const deleteTemp = (sendData: { type: string; uids: string }) => {
		Dialog.show({
			title: '操作确认',
			content: '请确认是否删除所选择自定义参数模板',
			onOk: () => {
				return deleteParamsTemp(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '模板删除成功')
						);
						getData();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};
	const actionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						history.push(
							`/serviceList/paramterSetting/template/${middlewareName}/${type}/${chartVersion}/${record.uid}/${record.name}`
						);
					}}
				>
					编辑
				</LinkButton>
				<LinkButton
					onClick={() => {
						const sendData = {
							type: record.type,
							uids: record.uid
						};
						deleteTemp(sendData);
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	const handleSearch = (value: string) => {
		const list = originData.filter((item: any) =>
			item.name.includes(value)
		);
		setDataSource(list);
	};
	const onChange = (selectedRowKeys: string[], record: any) => {
		setSelectedRowKeys(selectedRowKeys);
	};
	return (
		<Table
			dataSource={dataSource}
			exact
			fixedBarExpandWidth={[24]}
			affixActionBar
			primaryKey="uid"
			operation={Operation}
			search={{
				onSearch: handleSearch,
				placeholder: '请输入搜索内容'
			}}
			rowSelection={{
				onChange: onChange,
				selectedRowKeys: selectedRowKeys
			}}
		>
			<Table.Column title="模板名称" dataIndex="name" width={160} />
			<Table.Column title="模板描述" dataIndex="description" />
			<Table.Column
				title="操作"
				dataIndex="action"
				cell={actionRender}
				lock="right"
				width={100}
			/>
		</Table>
	);
};
export default ParamterTemplate;
