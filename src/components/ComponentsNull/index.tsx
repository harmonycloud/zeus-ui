import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import noData from '@/assets/images/nodata.svg';
import { Button } from 'antd';
import { StoreState, globalVarProps } from '@/types/index';
import storage from '@/utils/storage';
import './index.scss';

interface ComponentNullProps {
	title: string;
	globalVar: globalVarProps;
}
const ComponentNull = (props: ComponentNullProps) => {
	const { title } = props;
	const { cluster } = props.globalVar;
	const history = useHistory();
	return (
		<div className="no-data-content">
			<img width={140} height={140} src={noData} />
			<p>{title}</p>
			<Button
				style={{ marginTop: 8 }}
				type="primary"
				onClick={() => {
					storage.setLocal('cluster-detail-current-tab', 'component');
					history.push(
						`/systemManagement/resourcePoolManagement/resourcePoolDetail/${cluster.id}/${cluster.nickname}`
					);
				}}
			>
				点击跳转
			</Button>
		</div>
	);
};
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(ComponentNull);
