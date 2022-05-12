import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { Checkbox, notification } from 'antd';
import ProTable from '@/components/ProTable';
import SelectBlock from '@/components/SelectBlock';
import { getParamsTemp } from '@/services/template';
import { questionTooltipRender } from '@/utils/utils';
import { ConfigItem, ParamterTemplateItem } from '../detail';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
interface CompareParamTemplateParams {
	name: string;
	aliasName: string;
	type: string;
	chartVersion: string;
	uid1: string;
	uid2: string;
}
export default function CompareParamTemplate(): JSX.Element {
	const { uid1, uid2, type, chartVersion }: CompareParamTemplateParams =
		useParams();
	const [dataSource, setDataSource] = useState<ConfigItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<ConfigItem[]>([]);
	const [checked, setChecked] = useState<boolean>(true);
	const [temp1, setTemp1] = useState<ParamterTemplateItem>();
	const [temp2, setTemp2] = useState<ParamterTemplateItem>();
	const [searchText, setSearchText] = useState<string>('');
	useEffect(() => {
		if (uid1 && uid2) {
			const sendData1 = {
				uid: uid1,
				type,
				chartVersion
			};
			getParamsTemp(sendData1).then((res) => {
				if (res.success) {
					setTemp1(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
			const sendData2 = {
				uid: uid2,
				type,
				chartVersion
			};
			getParamsTemp(sendData2).then((res) => {
				if (res.success) {
					setTemp2(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, []);

	useEffect(() => {
		if (checked) {
			const list = dataSource.filter(
				(item) => item[temp1?.name || ''] !== item[temp2?.name || '']
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
	}, [dataSource]);

	useEffect(() => {
		if (temp1 && temp2) {
			const list = temp1.customConfigList?.map((item) => {
				item[temp1.name] = item.value;
				return item;
			});
			list &&
				list.forEach((item) => {
					temp2.customConfigList &&
						temp2.customConfigList.map((i) => {
							if (i.name === item.name) {
								item[temp2.name] = i.value;
								return item;
							}
						});
				});
			setDataSource(list || []);
		}
	}, [temp1, temp2]);

	const handleSearch = (value: string) => {
		const list = dataSource.filter((item) => item.name.includes(value));
		setShowDataSource(list);
		setSearchText(value);
	};
	const onChange = (e: CheckboxChangeEvent) => {
		console.log(e);
		if (e.target.checked) {
			const list = dataSource.filter(
				(item) => item[temp1?.name || ''] !== item[temp2?.name || '']
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
		setChecked(e.target.checked);
		setSearchText('');
	};
	const isRestartRender = (value: boolean) => {
		return value ? '是' : '否';
	};
	return (
		<ProPage>
			<ProHeader
				title="参数模版对比"
				onBack={() => window.history.back()}
			/>
			<ProContent>
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title">对比模版信息</div>
				</div>
				<SelectBlock
					options={[
						{ value: uid1, label: temp1?.name },
						{ value: uid2, label: temp2?.name }
					]}
					currentValue={''}
				/>
				<div className="title-content" style={{ marginTop: 34 }}>
					<div className="blue-line"></div>
					<div className="detail-title">参数对比</div>
				</div>
				<ProTable
					dataSource={showDataSource}
					pagination={false}
					search={{
						onSearch: handleSearch,
						onChange: (value) => setSearchText(value.target.value),
						value: searchText,
						style: { width: '200px' },
						placeholder: '请输入关键字内容'
					}}
					operation={{
						secondary: (
							<Checkbox onChange={onChange} checked={checked}>
								只看差异值
							</Checkbox>
						)
					}}
					rowKey="name"
				>
					<ProTable.Column
						title="参数名"
						dataIndex="name"
						width={210}
						ellipsis={true}
						// render={defaultValueRender}
						fixed="left"
					/>
					<ProTable.Column
						title={temp1?.name}
						dataIndex={temp1?.name}
						ellipsis={true}
						// render={defaultValueRender}
					/>
					<ProTable.Column
						title={temp2?.name}
						dataIndex={temp2?.name}
						ellipsis={true}
						// cell={defaultValueRender}
					/>
					<ProTable.Column
						title="默认值"
						dataIndex="defaultValue"
						ellipsis={true}
						// cell={defaultValueRender}
					/>
					<ProTable.Column
						title="是否重启"
						dataIndex="restart"
						render={isRestartRender}
						filterMultiple={false}
						onFilter={(value, record: ConfigItem) =>
							record.restart === value
						}
						// filterMode="single"
						filters={[
							{ value: true, text: '是' },
							{ value: false, text: '否' }
						]}
						width={140}
					/>
					<ProTable.Column
						title="参数值范围"
						dataIndex="ranges"
						render={questionTooltipRender}
						width={100}
					/>
					<ProTable.Column
						title="参数描述"
						dataIndex="description"
						render={questionTooltipRender}
						width={100}
					/>
				</ProTable>
			</ProContent>
		</ProPage>
	);
}
