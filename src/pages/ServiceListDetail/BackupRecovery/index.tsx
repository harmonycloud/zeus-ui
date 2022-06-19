import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import DefaultPicture from '@/components/DefaultPicture';
import ComponentNull from '@/components/ComponentsNull';
import BackupTask from './backupBask';
import { BackupRecoveryProps, DetailParams } from '../detail';

export default function BackupRecovery(
	props: BackupRecoveryProps
): JSX.Element {
	const params: DetailParams = useParams();
	const [customMid, setCustomMid] = useState<boolean>(false);
	const [capabilities, setCapabilities] = useState<string[]>([]);
	const { storage, clusterId, namespace } = props;
	useEffect(() => {
		setCustomMid(props.customMid);
		setCapabilities(props.capabilities || []);
	}, [props]);

	if (storage) {
		if (!storage.backup || !storage.backup.storage) {
			return (
				<ComponentNull title="该功能所需要备份存储工具支持，您可前往“集群——>平台组件进行安装" />
			);
		}
	}

	if (customMid && !capabilities.includes('backup')) {
		return <DefaultPicture />;
	}
	return <BackupTask clusterId={clusterId} namespace={namespace} />;
}
