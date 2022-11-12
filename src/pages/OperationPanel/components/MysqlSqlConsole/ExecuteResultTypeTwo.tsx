import React from 'react';
import { ExecuteResultTypeTwoProps } from '../../index.d';
export default function ExecuteResultTypeTwo(
	props: ExecuteResultTypeTwoProps
): JSX.Element {
	const { res } = props;
	return (
		<div>
			<p>执行失败</p>
			<p>{res.errorMsg}</p>
			<p>{res.errorDetail}</p>
		</div>
	);
}
