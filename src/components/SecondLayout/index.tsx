import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router';
import { Location } from 'history';
import { CascaderSelect } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import { StoreState, globalVarProps } from '@/types/index';
import { getList } from '@/services/serviceList';
import { serviceListItemProps } from '@/pages/ServiceList/service.list';
import { filtersProps } from '@/types/comment';

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
		clusterId: string,
		namespace: string
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
	console.log(location);
	useEffect(() => {
		if (JSON.stringify(namespace) !== '{}') {
			getList({
				clusterId: cluster.id,
				namespace: namespace.name,
				keyword: ''
			}).then((res) => {
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
							cluster.id,
							namespace.name
						);
					} else {
						if (list[0].children.length > 0) {
							setCurrent(list[0].children[0].value);
							onChange(
								list[0].children[0].value,
								list[0].value,
								cluster.id,
								namespace.name
							);
						} else {
							setCurrent('无服务');
							onChange(
								'undefined',
								'undefined',
								cluster.id,
								namespace.name
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
			cluster.id,
			namespace.name
		);
	};
	return (
		<Page>
			<Header
				title={title}
				subTitle={subTitle}
				hasBackArrow={hasBackArrow}
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
