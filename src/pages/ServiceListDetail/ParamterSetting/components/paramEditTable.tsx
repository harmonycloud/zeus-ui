import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Table, Button, Search } from '@alicloud/console-components';
import {
	setParamTemplateConfig,
	setParamTemplateConfigClear
} from '@/redux/param/param';
import { questionTooltipRender, tooltipRender } from '@/utils/utils';

import { ConfigItem, ParamterItem } from '../../detail';
import { paramReduxProps, StoreState } from '@/types';
import HeaderLayout from '@/components/HeaderLayout';
interface ParamEditTableProps {
	param: paramReduxProps;
	setParamTemplateConfig: (value: ConfigItem[]) => void;
	setParamTemplateConfigClear: () => void;
}
function ParamEditTable(props: ParamEditTableProps): JSX.Element {
	const { param, setParamTemplateConfig, setParamTemplateConfigClear } =
		props;
	const [dataSource, setDataSource] = useState<ConfigItem[]>(
		param.customConfigList.map((item) => {
			item.value = item.value || item.defaultValue;
			item.modifiedValue = item.value || item.defaultValue;
			return item;
		})
	);
	const [editFlag, setEditFlag] = useState<boolean>(false);

	const handleSearch = (value: string) => {
		const list = param.customConfigList.filter((item: any) =>
			item.name.includes(value)
		);
		setDataSource(list);
	};
	const saveTemplate = () => {
		setParamTemplateConfig(dataSource);
		setEditFlag(false);
	};
	const isRestartRender = (
		value: boolean,
		index: number,
		record: ParamterItem
	) => {
		return value ? '是' : '否';
	};
	const modifyValueRender = (
		value: string,
		index: number,
		record: ConfigItem
	) => {
		if (editFlag) {
			console.log('edit');
		} else {
			return value;
		}
	};

	return (
		<div className="zeus-param-edit-table-content">
			<HeaderLayout
				style={{ marginBottom: 8 }}
				left={
					<>
						{editFlag === true && (
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
									type="normal"
									onClick={() => setEditFlag(false)}
								>
									取消
								</Button>
							</>
						)}
						{editFlag === false && (
							<Button
								className="mr-8"
								onClick={() => {
									setEditFlag(true);
								}}
								type="primary"
							>
								编辑
							</Button>
						)}
						<Search
							onSearch={handleSearch}
							hasClear
							style={{ width: '200px' }}
							placeholder="请输入搜索内容"
						/>
					</>
				}
			/>
			<Table dataSource={dataSource} hasBorder={false} primaryKey="name">
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
					title="默认值"
					dataIndex="defaultValue"
					cell={(value: string, index: number, record: any) =>
						tooltipRender(value, index, record, 410)
					}
					width={410}
				/>
				<Table.Column
					title="修改目标值"
					dataIndex="modifiedValue"
					cell={modifyValueRender}
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
		</div>
	);
}
const mapStateToProps = (state: StoreState) => ({
	param: state.param
});
export default connect(mapStateToProps, {
	setParamTemplateConfig,
	setParamTemplateConfigClear
})(ParamEditTable);
