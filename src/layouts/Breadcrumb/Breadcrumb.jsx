import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@alicloud/console-components';
import './breadcrumb.scss';

import breadcrumbMap from './breadcrumbMap';

export default function MdBreadcrumb(props) {
	const { pathname } = props;
	const [pathList, setPathList] = useState([]);

	// 根据整路由拿到可用分级路由
	const getValidPathes = (pathname) => {
		const arr = pathname.split('/');
		const validPathes = arr.filter((i) =>
			Object.keys(breadcrumbMap).includes(i)
		);
		setPathList(validPathes);
	};

	// 获取当前级整路由
	const getPath = (route) => {
		if (route) {
			let index = pathname.indexOf(route);
			return pathname.substring(0, index) + route;
		}
		return '/';
	};

	useEffect(() => {
		if (pathname) getValidPathes(pathname);
	}, [pathname]);

	return (
		<div>
			{pathList.length > 1 && (
				<Breadcrumb className={'md-breadcrumb'}>
					{pathList.map((item, index) => {
						if (index === pathList.length - 1) {
							return (
								<Breadcrumb.Item key={index}>
									{breadcrumbMap[item]}
								</Breadcrumb.Item>
							);
						} else {
							return (
								<Breadcrumb.Item key={index}>
									<Link to={getPath(item)}>
										{breadcrumbMap[item]}
									</Link>
								</Breadcrumb.Item>
							);
						}
					})}
				</Breadcrumb>
			)}
		</div>
	);
}
