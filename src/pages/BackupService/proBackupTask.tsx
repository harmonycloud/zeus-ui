import React, { useState, useEffect } from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import BackupBask from '../ServiceListDetail/BackupRecovery/backupBask';

export default function ProBackupBask(): JSX.Element {
	return (
		<ProPage>
			<ProHeader
				title="备份任务"
				subTitle="发布中间件需要使用的备份任务"
			/>
			<ProContent>
				<BackupBask />
			</ProContent>
		</ProPage>
	);
}
