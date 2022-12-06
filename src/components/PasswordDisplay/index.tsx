import React, { useState } from 'react';

interface passwordDisplayProps {
	value: string;
}
export default function PasswordDisplay(
	props: passwordDisplayProps
): JSX.Element {
	const { value } = props;
	const [visible, setVisible] = useState<boolean>(false);
	return (
		<span style={{ display: 'flex', alignItems: 'center' }}>
			{visible ? value : '******'}
			{visible ? (
				<span
					className="name-link ml-12"
					onClick={() => setVisible(false)}
				>
					隐藏
				</span>
			) : (
				<span
					className="name-link ml-12"
					onClick={() => setVisible(true)}
				>
					查看
				</span>
			)}
		</span>
	);
}
