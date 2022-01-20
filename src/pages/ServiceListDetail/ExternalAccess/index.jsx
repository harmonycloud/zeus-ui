import React from 'react';
import IngressList from '@/pages/Ingress';
import DefaultPicture from '@/components/DefaultPicture';

export default function ExternalAccess(props) {
	const { customMid, capabilities, middlewareName, type } = props;
	if (customMid && !capabilities.includes('ingress')) {
		return <DefaultPicture />;
	}
	return (
		<IngressList
			entry="detail"
			type={type}
			middlewareName={middlewareName}
		/>
	);
}
