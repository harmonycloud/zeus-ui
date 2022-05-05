import { MoreOutlined } from '@ant-design/icons';
import React, { ReactElement } from 'react';
import { ActionsProps, LinkButtonProps } from './actions';
import { Dropdown, Menu } from 'antd';
import './index.scss';

const Actions = (props: ActionsProps) => {
	const { children = [], threshold = 3 } = props;
	if (children.length < threshold) {
		return (
			<div className="zeus-actions-content">
				{children?.map((item: React.ReactNode, index: number) => {
					return (
						<LinkButton
							style={{ marginRight: 8, marginLeft: 8 }}
							key={index}
							onClick={(item as ReactElement).props.onClick}
						>
							{(item as ReactElement).props.children}
						</LinkButton>
					);
				})}
			</div>
		);
	} else {
		const l1 = children.slice(0, threshold);
		const l2 = children.slice(threshold);
		const menu = l2.map((item: React.ReactNode, index: number) => {
			return {
				label: (
					<span onClick={(item as ReactElement).props.onClick}>
						{(item as ReactElement).props.children}
					</span>
				),
				key: index
			};
		});
		return (
			<div className="zeus-actions-content">
				{l1.map((item: React.ReactNode, index: number) => {
					return (
						<LinkButton
							style={{ marginRight: 8, marginLeft: 8 }}
							key={index}
							onClick={(item as ReactElement).props.onClick}
						>
							{(item as ReactElement).props.children}
						</LinkButton>
					);
				})}
				<Dropdown trigger={['click']} overlay={<Menu items={menu} />}>
					<MoreOutlined
						style={{
							fontSize: 14,
							marginLeft: 4,
							cursor: 'pointer'
						}}
					/>
				</Dropdown>
			</div>
		);
	}
};
const LinkButton = (props: LinkButtonProps) => {
	const { disabled = false, children, onClick, style } = props;
	return (
		<span
			style={style}
			className={disabled ? 'displayed-name' : 'name-link'}
			onClick={onClick}
		>
			{children}
		</span>
	);
};

Actions.LinkButton = LinkButton;
export default Actions;
