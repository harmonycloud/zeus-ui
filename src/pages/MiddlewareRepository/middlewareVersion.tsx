import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { Message, Button } from '@alicloud/console-components';
import { StoreState, globalVarProps } from '@/types/index';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { getTypeVersion } from '@/services/repository';
import messageConfig from '@/components/messageConfig';
import { middlewareProps } from './middleware';
import Table from '@/components/MidTable';
import './index.scss';

interface versionProps {
	globalVar: globalVarProps;
}
interface paramsProps {
	type: string;
}
function MiddlewareVersion(props: versionProps): JSX.Element {
	const {
		globalVar: { cluster }
	} = props;
	const params: paramsProps = useParams();
	const [originData, setOriginData] = useState<middlewareProps[]>([]);
	const [dataSource, setDataSource] = useState<middlewareProps[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(cluster) !== '{}') {
			getTypeVersion({
				clusterId: cluster.id,
				type: params.type
			}).then((res) => {
				if (res.success) {
					if (mounted) {
						setOriginData(res.data);
					}
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
		return () => {
			mounted = false;
		};
	}, [props]);
	const Operation = {
		primary: (
			<Button onClick={() => setVisible(true)} type="primary">
				上架新版本
			</Button>
		)
	};
	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = originData.filter(
				(item) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
			setDataSource(list);
		} else {
			setDataSource(dataSource);
		}
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const dsTemp = dataSource.sort((a, b) => {
				const result =
					moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
				console.log(result);
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		}
	};
	return (
		<Page>
			<Header
				title={`${params.type}版本管理`}
				hasBackArrow={true}
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
				<Message type="warning">
					本系统范围内其它资源池使用过的中间件版本，都可以自主选择是否安装升级到更新版本
				</Message>
				<div className="middleware-version-content">
					<Table
						dataSource={dataSource}
						exact
						fixedBarExpandWidth={[24]}
						affixActionBar
						showRefresh
						onRefresh={() => console.log('refresh')}
						primaryKey="key"
						operation={Operation}
						onFilter={onFilter}
						onSort={onSort}
					>
						<Table.Column title="类型" dataIndex="userName" />
						<Table.Column title="描述" dataIndex="userName" />
						<Table.Column title="版本状态" dataIndex="userName" />
						<Table.Column title="版本" dataIndex="userName" />
						<Table.Column
							title="上架时间"
							dataIndex="userName"
							sortable
						/>
						<Table.Column title="操作" dataIndex="userName" />
					</Table>
				</div>
			</Content>
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(MiddlewareVersion);
