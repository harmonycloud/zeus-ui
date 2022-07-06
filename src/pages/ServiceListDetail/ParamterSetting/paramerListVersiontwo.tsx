import React from 'react';
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
		<ParamEditTable
			type={type}
			clusterId={clusterId}
			namespace={namespace}
			middlewareName={middlewareName}
			source="list"
		/>
	);
}
