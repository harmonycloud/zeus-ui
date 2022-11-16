import React from 'react';
import { ExecuteResultTypeOneProps } from '../../index.d';
export default function ExecuteResultTypeTwo(
	props: ExecuteResultTypeOneProps
): JSX.Element {
	const { resData } = props;
	return (
		<div>
			<p>执行成功</p>
			<p>执行结果：</p>
			{resData.data instanceof Array ? (
				<>
					{resData.data.map((item: string) => {
						return <p key={item}>{item}</p>;
					})}
				</>
			) : (
				<p>{resData.data}</p>
			)}
		</div>
	);
}
