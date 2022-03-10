import React, { useEffect, useState } from 'react';
import { Button, Message, Dialog } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import { useHistory, useParams } from 'react-router';
import Table from '@/components/MidTable';
import { getParamsTemps, deleteParamsTemp } from '@/services/template';
import messageConfig from '@/components/messageConfig';

interface ParamterTemplateProps {
	type: string;
	chartVersion: string;
	middlewareName: string;
}
interface paramsProps {
	name: string;
	aliasName: string;
}
const ParamterTemplate = (props: ParamterTemplateProps) => {
	const { type, chartVersion, middlewareName } = props;
	const [originData, setOriginData] = useState([]);
	const [dataSource, setDataSource] = useState([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
	const history = useHistory();
	const params: paramsProps = useParams();
	console.log(params);
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
							`/serviceList/${params.name}/${params.aliasName}/paramterSetting/template/${middlewareName}/${type}/${chartVersion}`
						);
					}}
					type="primary"
				>
					新建
				</Button>
				{selectedRowKeys.length > 0 && (
					<Button
						onClick={() => {
							console.log('click');
						}}
						type="secondary"
						disabled={selectedRowKeys.length !== 2}
					>
						对比
					</Button>
				)}
				{selectedRowKeys.length > 0 && (
					<Button
						onClick={() => {
							const sendData = {
								type,
								uids: selectedRowKeys.join(',')
							};
							deleteTemp(sendData);
						}}
						type="primary"
						warning
					>
						删除
					</Button>
				)}
				{selectedRowKeys.length > 0 && (
					<Button
						type="normal"
						onClick={() => {
							setSelectedRowKeys([]);
						}}
					>
						取消
					</Button>
				)}
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
							`/serviceList/${params.name}/${params.aliasName}/paramterSetting/template/${middlewareName}/${type}/${chartVersion}/${record.uid}/${record.name}`
						);
					}}
					disabled={selectedRowKeys.length > 0}
				>
					使用
				</LinkButton>
				<LinkButton
					onClick={() => {
						history.push(
							`/serviceList/${params.name}/${params.aliasName}/paramterSetting/template/${middlewareName}/${type}/${chartVersion}/${record.uid}/${record.name}`
						);
					}}
					disabled={selectedRowKeys.length > 0}
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
					disabled={selectedRowKeys.length > 0}
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
			<Table.Column title="创建时间" dataIndex="createTime" />
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
