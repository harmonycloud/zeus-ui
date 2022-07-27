import React, { useEffect, useState } from 'react';
import DefaultPicture from '@/components/DefaultPicture';
import ComponentNull from '@/components/ComponentsNull';
import BackupTask from './backupBask';
import { BackupRecoveryProps } from '../detail';
import { getBackupAddress } from '@/services/backup';

export default function BackupRecovery(
	props: BackupRecoveryProps
): JSX.Element {
	const { clusterId, namespace, data } = props;
	const [customMid, setCustomMid] = useState<boolean>(false);
	const [capabilities, setCapabilities] = useState<string[]>([]);
	const [storageFlag, setStorageFlag] = useState<boolean>(false);
	useEffect(() => {
		setCustomMid(props.customMid);
		setCapabilities(props.capabilities || []);
	}, [props]);
	useEffect(() => {
		getBackupAddress({ keyword: '' }).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					setStorageFlag(true);
				} else {
					setStorageFlag(false);
				}
			} else {
				setStorageFlag(false);
			}
		});
	}, []);
	if (storageFlag) {
		return (
			<ComponentNull title="该功能所需要备份存储工具支持，您可前往“备份服务——>备份位置进行添加" />
		);
	}

	if (customMid && !capabilities.includes('backup')) {
		return <DefaultPicture />;
	}
	return (
		<BackupTask clusterId={clusterId} namespace={namespace} data={data} />
	);
}
