import React from 'react';
import { Tab } from '@alicloud/console-components';
import List from './list';
import Config from './config';

export default function BackupRecovery(props) {
	return (
		<div>
			<Tab>
				<Tab.Item title="备份列表">
					<List data={props} backup={props.backup} />
				</Tab.Item>
				<Tab.Item title="备份设置">
					<Config data={props} />
				</Tab.Item>
			</Tab>
		</div>
	);
}
