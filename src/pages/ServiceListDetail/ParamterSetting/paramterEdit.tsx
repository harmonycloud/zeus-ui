import React, { useEffect, useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import {
	Button,
	Message,
	Table,
	Search,
	Balloon,
	Dialog
} from '@alicloud/console-components';
import HeaderLayout from '@/components/HeaderLayout';
import { useParams, useHistory } from 'react-router';
import {
	initParamsTemp,
	createParamsTemp,
	getParamsTemp,
	editParamsTemp
} from '@/services/template';
import messageConfig from '@/components/messageConfig';
import EditParamItem from './editParamItem';
import SaveParamTemp from './saveParamTemp';
import { tooltipRender } from '@/utils/utils';
import storage from '@/utils/storage';

interface ParamsProps {
	type: string;
	chartVersion: string;
	middlewareName: string;
	uid: string;
	templateName: string;
	name: string;
	aliasName: string;
}
export interface TempProps {
	name: string;
	description: string;
}
export interface ParamterItem {
	defaultValue: string;
	modifiedValue: string;
	description: string;
	name: string;
	paramType: null | any;
	pattern: null | any;
	ranges: string;
	restart: boolean;
	value: null | any;
}
const Tooltip = Balloon.Tooltip;
const ParamterEdit = () => {
	const {
		type,
		chartVersion,
		middlewareName,
		uid,
		templateName,
		name,
		aliasName
	}: ParamsProps = useParams();
	const history = useHistory();
	const [originData, setOriginData] = useState<ParamterItem[]>([]);
	const [dataSource, setDataSource] = useState<ParamterItem[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [editData, setEditData] = useState<ParamterItem>();
	const [saveVisible, setSaveVisible] = useState<boolean>(false);
	const [tempData, setTempData] = useState<TempProps>();
	useEffect(() => {
		storage.setSession('paramsTab', 'template');
	}, []);
	useEffect(() => {
		if (uid) {
			getParamsTemp({ type, chartVersion, uid, templateName }).then(
				(res) => {
					if (res.success) {
						setTempData({
							name: res.data.name,
							description: res.errorMsg.data.description
						});
						const list = res.data.customConfigList.map(
							(item: any) => {
								item.modifiedValue =
									item.value || item.defaultValue;
								return item;
							}
						);
						setOriginData(list);
						setDataSource(list);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				}
			);
		} else {
			initParamsTemp({ type, chartVersion }).then((res) => {
				if (res.success) {
					const list = res.data.map((item: any) => {
						item.modifiedValue = item.defaultValue;
						item.value = item.defaultValue;
						return item;
					});
					setOriginData(list);
					setDataSource(list);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	}, [type, chartVersion]);
	const saveTemplate = () => {
		setSaveVisible(true);
	};
	const isRestartRender = (
		value: boolean,
		index: number,
		record: ParamterItem
	) => {
		return value ? '是' : '否';
	};
	const handleSearch = (value: string) => {
		const list = originData.filter((item: any) =>
			item.name.includes(value)
		);
		setDataSource(list);
	};
	const onChange = (selectedRowKeys: any, record: any) => {
		setEditData(record[0]);
	};
	const onCreate = (values: ParamterItem) => {
		const editList = dataSource.map((item: ParamterItem) => {
			if (item.name === values.name) {
				item.modifiedValue = values.modifiedValue;
				item.description = values.description;
				item.restart = values.restart;
			}
			return item;
		});
		setDataSource(editList);
		setVisible(false);
	};
	const onSaveCreate = (value: { name: string; description: string }) => {
		setSaveVisible(false);
		const list = dataSource.map((item: ParamterItem) => {
			item.value = item.modifiedValue;
			return item;
		});
		const flag: ParamterItem | undefined = dataSource.find(
			(item) => item.value.trim() === ''
		);
		if (flag) {
			Message.show(
				messageConfig(
					'error',
					'失败',
					`${flag.name}参数存在目标值为空！`
				)
			);
			return;
		}
		if (uid) {
			const sendData = {
				type,
				name: value.name,
				description: value.description,
				customConfigList: list,
				uid: uid
			};
			editParamsTemp(sendData).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '参数模板修改成功')
					);
					history.push(
						`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}`
					);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		} else {
			const sendData = {
				type,
				name: value.name,
				description: value.description,
				customConfigList: list
			};
			createParamsTemp(sendData).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '参数模板创建成功')
					);
					history.push(
						`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}`
					);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	};
	const modifiedValueRender = (
		value: any,
		index: number,
		record: ParamterItem
	) => {
		const flag = record.value != record.modifiedValue;
		return (
			<span style={{ color: flag ? '#C80000' : '#333333' }}>{value}</span>
		);
	};
	const descriptionRender = (
		value: string,
		index: number,
		record: ParamterItem
	) => {
		return (
			<Tooltip
				trigger={
					<span
						className="table-col-w146-h2"
						onClick={() => {
							const dialog = Dialog.show({
								title: '参数描述',
								content: (
									<div
										style={{
											maxWidth: '560px',
											lineHeight: '16px'
										}}
									>
										{value}
									</div>
								),
								footer: (
									<Button
										type="primary"
										onClick={() => dialog.hide()}
									>
										确认
									</Button>
								)
							});
						}}
					>
						{value}
					</span>
				}
				align="t"
			>
				{value}
			</Tooltip>
		);
	};
	return (
		<Page>
			<Header
				title="参数模板编辑"
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<HeaderLayout
					style={{ marginBottom: 8 }}
					left={
						<>
							<Button
								onClick={saveTemplate}
								className="mr-8"
								type="primary"
							>
								保存
							</Button>
							<Button
								className="mr-8"
								onClick={() => {
									setVisible(true);
								}}
								type="primary"
							>
								编辑
							</Button>
							<Search
								onSearch={handleSearch}
								hasClear
								style={{ width: '200px' }}
								placeholder="请输入搜索内容"
							/>
						</>
					}
				/>
				<Table
					dataSource={dataSource}
					hasBorder={false}
					primaryKey="name"
					rowSelection={{ mode: 'single', onChange: onChange }}
				>
					<Table.Column
						title="参数名"
						dataIndex="name"
						width={210}
						cell={(value: string, index: number, record: any) =>
							tooltipRender(value, index, record, 210)
						}
						lock="left"
					/>
					<Table.Column
						title="参数默认值"
						dataIndex="defaultValue"
						cell={(value: string, index: number, record: any) =>
							tooltipRender(value, index, record, 210)
						}
						width={210}
					/>
					<Table.Column
						title="修改目标值"
						dataIndex="modifiedValue"
						cell={modifiedValueRender}
						width={210}
					/>
					<Table.Column
						title="是否重启"
						dataIndex="restart"
						cell={isRestartRender}
						width={100}
					/>
					<Table.Column
						title="参数值范围"
						dataIndex="ranges"
						width={350}
					/>
					<Table.Column
						title="参数描述"
						dataIndex="description"
						cell={descriptionRender}
						width={200}
					/>
				</Table>
				{visible && (
					<EditParamItem
						data={editData}
						visible={visible}
						onCancel={() => setVisible(false)}
						uid={uid}
						onCreate={onCreate}
						type={type}
						chartVersion={chartVersion}
						templateName={templateName}
					/>
				)}
				{saveVisible && (
					<SaveParamTemp
						visible={saveVisible}
						onCancel={() => setSaveVisible(false)}
						onCreate={onSaveCreate}
						data={tempData}
					/>
				)}
			</Content>
		</Page>
	);
};

export default ParamterEdit;
