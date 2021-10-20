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
		name: string,
		type: string,
		namespace: string,
		cluster: clusterType
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
	const { cluster, namespace } = props.globalVar;
	const [data, setData] = useState([]);
	const [current, setCurrent] = useState<string>();
	const location: Location<stateProps> = useLocation();
	useEffect(() => {
		if (JSON.stringify(namespace) !== '{}') {
			getList({
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
							children: item.serviceList.map((i) => {
								return {
									label: i.aliasName || i.name,
									value: i.name,
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
						onChange(
							location.state.middlewareName,
							location.state.middlewareType,
							namespace.name,
							cluster
						);
					} else {
						if (list.length > 0 && list[0].children.length > 0) {
							setCurrent(list[0].children[0].value);
							onChange(
								list[0].children[0].value,
								list[0].value,
								namespace.name,
								cluster
							);
						} else {
							setCurrent('无服务');
							onChange(
								'undefined',
								'undefined',
								namespace.name,
								cluster
							);
						}
					}
				}
			});
		}
	}, [namespace, cluster]);
	const handleChange = (value: string | string[], data: any, extra: any) => {
		setCurrent(value as string);
		onChange(
			value as string,
			extra.selectedPath[0].value,
			namespace.name,
			cluster
		);
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
