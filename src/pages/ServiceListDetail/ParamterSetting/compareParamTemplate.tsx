import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { Search, Table, Checkbox, Message } from '@alicloud/console-components';
import SelectBlock from '@/components/SelectBlock';
import HeaderLayout from '@/components/HeaderLayout';
import { getParamsTemp } from '@/services/template';
import { defaultValueRender, questionTooltipRender } from '@/utils/utils';
import { ConfigItem, ParamterTemplateItem } from '../detail';
import messageConfig from '@/components/messageConfig';
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
					Message.show(messageConfig('error', '失败', res));
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
					Message.show(messageConfig('error', '失败', res));
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
			list?.forEach((item) => {
				temp2.customConfigList?.map((i) => {
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
	const onChange = (value: boolean) => {
		if (value) {
			const list = dataSource.filter(
				(item) => item[temp1?.name || ''] !== item[temp2?.name || '']
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
		setChecked(value);
		setSearchText('');
	};
	const isRestartRender = (value: boolean) => {
		return value ? '是' : '否';
	};
	const onFilter = (filterParams: any) => {
		const {
			restart: { selectedKeys }
		} = filterParams;
		if (selectedKeys.length === 0) {
			setShowDataSource(dataSource);
		} else {
			const tempData = dataSource.filter(
				(item: any) => item.restart + '' === selectedKeys[0]
			);
			setShowDataSource(tempData);
		}
	};
	return (
		<Page>
			<Header
				title="模版参数对比"
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
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
				<HeaderLayout
					style={{ marginBottom: 8 }}
					left={
						<Search
							onSearch={handleSearch}
							onChange={(value: string) => setSearchText(value)}
							hasClear
							value={searchText}
							style={{ width: '200px' }}
							placeholder="请输入关键字内容"
						/>
					}
					right={
						<Checkbox
							onChange={onChange}
							checked={checked}
							label="只看差异值"
						/>
					}
				/>
				<Table
					dataSource={showDataSource}
					hasBorder={false}
					primaryKey="name"
					onFilter={onFilter}
				>
					<Table.Column
						title="参数名"
						dataIndex="name"
						width={210}
						cell={defaultValueRender}
						lock="left"
					/>
					<Table.Column
						title={temp1?.name}
						dataIndex={temp1?.name}
						cell={defaultValueRender}
					/>
					<Table.Column
						title={temp2?.name}
						dataIndex={temp2?.name}
						cell={defaultValueRender}
					/>
					<Table.Column
						title="默认值"
						dataIndex="defaultValue"
						cell={defaultValueRender}
					/>
					<Table.Column
						title="是否重启"
						dataIndex="restart"
						cell={isRestartRender}
						filterMode="single"
						filters={[
							{ value: 'true', label: '是' },
							{ value: 'false', label: '否' }
						]}
						width={140}
					/>
					<Table.Column
						title="参数值范围"
						dataIndex="ranges"
						cell={questionTooltipRender}
						width={100}
					/>
					<Table.Column
						title="参数描述"
						dataIndex="description"
						cell={questionTooltipRender}
						width={100}
					/>
				</Table>
			</Content>
		</Page>
	);
}
