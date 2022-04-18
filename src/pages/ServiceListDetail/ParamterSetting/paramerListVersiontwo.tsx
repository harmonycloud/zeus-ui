import React, { useState, useEffect } from 'react';
import { Page, Content } from '@alicloud/console-components-page';
import ParamEditTable from './components/paramEditTable';

interface ParamerListProps {
	clusterId: string;
	namespace: string;
	type: string;
	middlewareName: string;
}
export default function ParamerList(props: ParamerListProps): JSX.Element {
	const { clusterId, namespace, type, middlewareName } = props;
	return (
		<Page>
			<Content style={{ padding: '0 0', margin: '0' }}>
				<ParamEditTable
					type={type}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={middlewareName}
					source="list"
				/>
			</Content>
		</Page>
	);
}
