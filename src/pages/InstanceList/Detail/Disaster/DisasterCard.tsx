import React from 'react';
import { Icon } from '@alicloud/console-components';
import origin from '@/assets/images/o-instance.svg';
import backup from '@/assets/images/backup-instance.svg';
import PasswordDisplay from '@/components/PasswordDisplay';
import './index.scss';

interface disasterCardProps {
	originData?: any;
	backupData?: any;
	toCreateBackup?: () => void;
	deleteInstance?: () => void;
	toDetail?: () => void;
	toBasicInfo?: () => void;
}
export const DisasterOriginCard: (props: disasterCardProps) => JSX.Element = (
	props: disasterCardProps
) => {
	const { originData, toBasicInfo } = props;
	return (
		<div className="disaster-card">
			<div className="disaster-card-title" onClick={toBasicInfo}>
				<img src={origin} />
				<span>源实例信息</span>
			</div>
			<ul className="disaster-card-info">
				<li>
					<label>集群名称/命名空间 :</label>
					<span>
						{originData.cluster}/{originData.namespace}
					</span>
				</li>
				<li>
					<label>实例名称 :</label>
					<span>{originData.name}</span>
				</li>
				<li>
					<label>数据库账号 :</label>
					<span>{originData.dbUser}</span>
				</li>
				<li>
					<label>密码 :</label>
					<span>
						<PasswordDisplay value={originData.dbPass} />
					</span>
				</li>
				<li>
					<label>连接地址 :</label>
					<span>{originData.address}</span>
				</li>
			</ul>
		</div>
	);
};

export const DisasterBackupCardNone: (
	props: disasterCardProps
) => JSX.Element = (props: disasterCardProps) => {
	const { toCreateBackup } = props;
	return (
		<div className="disaster-card">
			<div className="disaster-card-title-backup">
				<img src={backup} />
				<span>灾备实例信息</span>
			</div>
			<ul className="disaster-card-none">
				<div className="disaster-card-add" onClick={toCreateBackup}>
					<Icon type="add" size="small" />
					<span>添加灾备实例</span>
				</div>
			</ul>
		</div>
	);
};

export const DisasterBackupCard: (props: disasterCardProps) => JSX.Element = (
	props: disasterCardProps
) => {
	const { backupData, deleteInstance, toDetail } = props;
	return (
		<div className="disaster-card">
			<div className="disaster-card-title-backup" onClick={toDetail}>
				<img src={backup} />
				<span>灾备实例信息</span>
			</div>
			<ul className="disaster-card-info">
				<li>
					<label>集群名称/命名空间 :</label>
					<span>
						{backupData.cluster}/{backupData.namespace}
					</span>
				</li>
				<li>
					<label>实例名称 :</label>
					<span>{backupData.name}</span>
				</li>
				<li>
					<label>数据库账号 :</label>
					<span>{backupData.dbUser}</span>
				</li>
				<li>
					<label>密码 :</label>
					<span>
						<PasswordDisplay value={backupData.dbPass} />
					</span>
				</li>
				<li>
					<label>连接地址 :</label>
					<span>{backupData.address}</span>
				</li>
			</ul>
			<div className="disaster-card-delete" onClick={deleteInstance}>
				<Icon type="ashbin" size="small" />
				<span>删除</span>
			</div>
		</div>
	);
};
