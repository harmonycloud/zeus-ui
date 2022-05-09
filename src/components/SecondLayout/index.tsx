import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import { Location } from 'history';
import { CascaderSelect } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { getList } from '@/services/serviceList';
import { serviceListItemProps } from '@/pages/ServiceList/service.list';
import { filtersProps } from '@/types/comment';
import { StoreState, globalVarProps, clusterType } from '@/types/index';
import './index.scss';

interface stateProps {
	middlewareName: string;
	middlewareType: string;
}
interface secondLayoutProps {
	title: string;
	subTitle: string;
	globalVar: globalVarProps;
	children: any;
	hasBackArrow?: boolean;
	onBackArrowClick?: () => void;
	childrenAlign?: any;
	style?: any;
	className?: string;
	onChange: (
		name: string | null,
		type: string,
		namespace: string,
		cluster: clusterType,
		aliasName?: string
	) => void;
}
function SecondLayout(props: secondLayoutProps): JSX.Element {
	const {
		title,
		subTitle,
		hasBackArrow = false,
		onBackArrowClick = () => window.history.back(),
		childrenAlign = 'right',
		style = {},
		className = '',
		onChange,
		children
	} = props;
	const { cluster, namespace, project } = props.globalVar;
	const [data, setData] = useState([]);
	const [current, setCurrent] = useState<string>();
	const location: Location<stateProps> = useLocation();
	useEffect(() => {
		if (JSON.stringify(namespace) !== '{}') {
			getList({
				projectId: project.projectId,
				clusterId: cluster.id,
				namespace: namespace.name,
				keyword: ''
			}).then((res) => {
				console.log(res);
				if (res.success) {
					const list = res.data.map((item: serviceListItemProps) => {
						const result: filtersProps = {
							value: item.chartName,
							label: item.name,
							aliasName: item.aliasName,
							children: item.serviceList.map((i) => {
								return {
									label: i.aliasName || i.name,
									value: i.name,
									namespace: i.namespace,
									isLeaf: true
								};
							})
						};
						return result;
					});
					setData(list);
					if (
						location.state?.middlewareName &&
						location.state?.middlewareType
					) {
						setCurrent(location.state.middlewareName);
						const temp = list.filter(
							(item: filtersProps) =>
								item.value === location.state.middlewareType
						);
						console.log(temp);
						const cur = temp[0].children.find(
							(item: filtersProps) =>
								item.value === location.state.middlewareName
						);
						onChange(
							location.state.middlewareName,
							location.state.middlewareType,
							cur.namespace,
							cluster,
							temp[0].aliasName
						);
					} else {
						if (list.length > 0 && list[0].children.length > 0) {
							setCurrent(list[0].children[0].value);
							onChange(
								list[0].children[0].value,
								list[0].value,
								list[0].children[0].namespace,
								cluster
							);
						} else {
							setCurrent('无服务');
							onChange(null, '', '', cluster, '');
						}
					}
				}
			});
		}
	}, [namespace, cluster]);
	const handleChange = (value: string | string[], data: any, extra: any) => {
		if (data.isLeaf) {
			// * 如果选的是叶子结点的话
			setCurrent(value as string);
			onChange(
				value as string,
				extra.selectedPath[0].value,
				data.namespace,
				cluster
			);
		} else {
			// * 如果选择的是父节点，那么就默认勾选叶子结点，如果没有叶子结点，则传参告诉选择的是服务类型，且无服务。
			if (data.children && data.children.length > 0) {
				setCurrent(data.children[0].value as string);
				onChange(
					data.children[0].value as string,
					extra.selectedPath[0].value,
					data.children[0].namespace,
					cluster
				);
			} else {
				setCurrent('无服务');
				onChange(
					null,
					extra.selectedPath[0].value,
					namespace.name,
					cluster
				);
			}
		}
	};
	return (
		<Page>
			<Header
				title={title}
				subTitle={subTitle}
				hasBackArrow={
					location?.state?.middlewareName ? hasBackArrow : false
				}
				onBackArrowClick={onBackArrowClick}
				childrenAlign={childrenAlign}
				className={className}
				style={style}
			>
				<CascaderSelect
					listStyle={{ width: '166px' }}
					style={{ width: '333px' }}
					dataSource={data}
					onChange={handleChange}
					expandTriggerType="hover"
					value={current}
					changeOnSelect={true}
					popupClassName="cascader-select"
				/>
			</Header>
			<Content>{children}</Content>
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(SecondLayout);
