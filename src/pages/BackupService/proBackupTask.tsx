import React from 'react';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import BackupBask from '../ServiceListDetail/BackupRecovery/backupBask';
import { StoreState } from '@/types';
import { connect } from 'react-redux';
import Backup from '@/assets/images/backup.svg';

function ProBackupBask(props: StoreState): JSX.Element {
	const {
		globalVar: { cluster, namespace }
	} = props;

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
				<BackupBask namespace="*" />
			</ProContent>
		</ProPage>
	);
}

const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(ProBackupBask);
