import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '@alicloud/console-components';
import storage from '@/utils/storage';
import './breadcrumb.scss';
import breadcrumbMap from './breadcrumbMap';

export interface BreadcrumbProps {
	pathname: string;
}
export default function MdBreadcrumb(props: BreadcrumbProps): JSX.Element {
	const { pathname } = props;
	const [pathList, setPathList] = useState<string[]>([]);
	// 根据整路由拿到可用分级路由
	const getValidPathes = (pathname: string) => {
		const arr = pathname.split('/');
		const validPathes = arr.filter((i) =>
			Object.keys(breadcrumbMap).includes(i)
		);
		setPathList(validPathes);
	};

	// 获取当前级整路由
	const getPath = (route: string, i: number) => {
		if (route === 'serviceList') {
			return storage.getSession('menuPath') || '/';
		}
		if (route.includes('middlewareRepository')) {
			return '/middlewareRepository';
		}
		if (route) {
			const arr = pathname.split('/');
			arr.length = i === 0 ? 3 : i + 2;
			const result = arr.join('/');
			return result;
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
									<Link to={getPath(item, index)}>
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
