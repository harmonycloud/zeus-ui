import React, { useState } from 'react';
import { Tab } from '@alicloud/console-components';
import ParamterList from './paramterList';
import ParamterHistory from './paramterHistory';
import DefaultPicture from '@/components/DefaultPicture';

export default function ParamterSetting(props) {
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities
	} = props;
	const [refreshFlag, setRefreshFlag] = useState(false);
	const handleChange = () => {
		setRefreshFlag(!refreshFlag);
	};
	if (customMid && !(capabilities || []).includes('ingress')) {
		return <DefaultPicture />;
	}
	return (
		<Tab>
			<Tab.Item title="参数列表">
				<ParamterList
					clusterId={clusterId}
					middlewareName={middlewareName}
					namespace={namespace}
					type={type}
					onFreshChange={handleChange}
				/>
			</Tab.Item>
			<Tab.Item title="参数修改历史">
				<ParamterHistory
					clusterId={clusterId}
					middlewareName={middlewareName}
					namespace={namespace}
					type={type}
					refreshFlag={refreshFlag}
				/>
			</Tab.Item>
		</Tab>
	);
}
