import React from 'react';
import SecondLayout from '@/components/SecondLayout';
import BackupRecovery from '@/pages/InstanceList/Detail/BackupRecovery';

export default function DataSecurity(): JSX.Element {
	const onChange = (value: string) => {
		console.log(value);
	};
	return (
		<SecondLayout
			title="数据安全"
			subTitle="主要用于数据的备份及恢复"
			hasBackArrow={true}
			onChange={onChange}
		>
			{/* <BackupRecovery /> */}
		</SecondLayout>
	);
}
