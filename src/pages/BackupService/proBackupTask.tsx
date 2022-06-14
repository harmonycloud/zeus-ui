import React, { useState, useEffect } from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import BackupBask from '../ServiceListDetail/BackupRecovery/backupBask';
import Backup from '@/assets/images/backup.svg';

export default function ProBackupBask(): JSX.Element {
	return (
		<ProPage>
			<ProHeader
				title="备份任务"
				subTitle="发布中间件需要使用的备份任务"
				avatar={{
					children: <img src={Backup} />,
					shape: 'square',
					size: 48,
					style: { background: '#f5f5f5' }
				}}
			/>
			<ProContent>
				<BackupBask />
			</ProContent>
		</ProPage>
	);
}
