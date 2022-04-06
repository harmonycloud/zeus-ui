import React from 'react';
import IngressList from '@/pages/Ingress';
import DefaultPicture from '@/components/DefaultPicture';
import { ExternalAccessProps } from '../detail';

export default function ExternalAccess(
	props: ExternalAccessProps
): JSX.Element {
	const { customMid, capabilities, middlewareName, type, namespace } = props;
	if (customMid && !capabilities.includes('ingress')) {
		return <DefaultPicture />;
	}
	return (
		<IngressList
			entry="detail"
			type={type}
			namespace={namespace}
			middlewareName={middlewareName}
		/>
	);
}
