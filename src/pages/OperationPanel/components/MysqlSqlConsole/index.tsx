import React, { useState } from 'react';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import CodeConsole from '../CodeConsole';
import ExecutionTable from '../ExectionTable';

export default function MysqlSqlConsole(): JSX.Element {
	const [paneProps] = useState<SplitPaneProps>({
		split: 'horizontal',
		minSize: '50%'
	});
	return (
		<SplitPane {...paneProps}>
			<div style={{ width: '100%' }}>
				<CodeConsole />
			</div>
			<div style={{ width: '100%', marginTop: 10 }}>
				<ExecutionTable />
			</div>
		</SplitPane>
	);
}
