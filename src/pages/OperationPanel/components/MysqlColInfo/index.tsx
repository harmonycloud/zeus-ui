import React, { useEffect, useState } from 'react';
import EditTable from '@/components/EditTable';
import { MysqlColInfoProps, MysqlColItem, MysqlDataType } from '../../index.d';
import { getMysqlDataType, updateMysqlCol } from '@/services/operatorPanel';
import { Button, Divider, notification, Space } from 'antd';

const basicData = {
	column: '',
	dataType: '',
	size: '',
	nullable: false,
	primary: true,
	autoIncrement: false,
	comment: ''
};
interface EditMysqlColItem extends MysqlColItem {
	key: string;
}
export default function MysqlColInfo(props: MysqlColInfoProps): JSX.Element {
	const {
		originData,
		handleChange,
		clusterId,
		namespace,
		middlewareName,
		tableName,
		databaseName
	} = props;
	const [dataSource, setDataSource] = useState<EditMysqlColItem[]>(
		originData?.columns?.map((item) => {
			return { ...item, key: item.column };
		}) || []
	);
	const [dataTypes, setDataTypes] = useState<any[]>([]);
	const [selectRow, setSelectRow] = useState<EditMysqlColItem>();
	useEffect(() => {
		getMysqlDataType({
			clusterId,
			middlewareName,
			namespace
		}).then((res) => {
			if (res.success) {
				const list = res.data.map((item: MysqlDataType) => {
					return {
						label: item.name,
						value: item.name
					};
				});
				setDataTypes(list);
			}
		});
	}, []);
	const columns = [
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			render: (text: any, record: any, index: number) => index + 1
		},
		{
			title: '列名',
			dataIndex: 'column',
			key: 'column',
			editable: true,
			width: 250,
			componentType: 'string'
		},
		{
			title: '类型',
			dataIndex: 'dataType',
			key: 'dataType',
			editable: true,
			width: 250,
			componentType: 'select',
			selectOptions: dataTypes
		},
		{
			title: '长度',
			dataIndex: 'size',
			key: 'size',
			editable: true,
			width: 100,
			componentType: 'string'
		},
		{
			title: '可空',
			dataIndex: 'nullable',
			key: 'nullable',
			editable: true,
			width: 80,
			componentType: 'checkbox'
		},
		{
			title: '主键',
			dataIndex: 'primary',
			key: 'primary',
			editable: true,
			width: 80,
			componentType: 'checkbox'
		},
		{
			title: '自增',
			dataIndex: 'autoIncrement',
			key: 'autoIncrement',
			editable: true,
			width: 80,
			componentType: 'checkbox'
		},
		{
			title: '备注',
			dataIndex: 'comment',
			key: 'comment',
			editable: true,
			componentType: 'string'
		}
	];
	const onChange = (list: any[]) => {
		handleChange(list);
	};
	const onSelectChange = (values: any) => {
		setSelectRow(values);
	};
	const save = () => {
		if (tableName && originData) {
			updateMysqlCol({
				database: databaseName,
				table: tableName,
				clusterId,
				namespace,
				middlewareName,
				columns: originData.columns
			}).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '列信息修改成功'
					});
				} else {
					notification.error({
						message: '失败',
						description: `${res.errorMsg}${
							res.errorDetail ? ':' + res.errorDetail : ''
						}`
					});
				}
			});
		}
	};
	return (
		<>
			<EditTable
				defaultColumns={columns}
				originData={dataSource}
				basicData={basicData}
				moveDownVisible
				moveUpVisible
				incrementVisible
				returnValues={onChange}
				returnSelectValues={onSelectChange}
			/>
			{tableName && (
				<>
					<Divider />
					<Space>
						<Button type="primary" onClick={save}>
							保存
						</Button>
						<Button>取消</Button>
					</Space>
				</>
			)}
		</>
	);
}
