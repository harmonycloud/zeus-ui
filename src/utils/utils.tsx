import React from 'react';
import { Icon, Balloon } from '@alicloud/console-components';
import { api } from '@/api.json';
import JSEncrypt from 'jsencrypt';
import moment from 'moment';

// * 组件复用
export const statusRender: (value: string) => JSX.Element = (value: string) => {
	switch (value) {
		case 'Creating':
			return (
				<>
					<Icon
						type="sync-alt"
						size="xs"
						style={{ color: '#0091FF' }}
					/>{' '}
					启动中
				</>
			);
		case 'Running':
			return (
				<>
					<Icon
						type="success1"
						size="xs"
						style={{ color: '#00A700' }}
					/>{' '}
					运行正常
				</>
			);
		case 'Failed':
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					运行异常
				</>
			);
		case 'RunningError':
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					运行异常
				</>
			);
		case '':
			return <></>;
		default:
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					运行异常
				</>
			);
	}
};

// * 备份列表状态
export const statusBackupRender: (value: string) => JSX.Element = (
	value: string
) => {
	switch (value) {
		case 'Running':
			return (
				<>
					<Icon
						type="sync-alt"
						size="xs"
						style={{ color: '#0091FF' }}
					/>{' '}
					进行中
				</>
			);
		case 'Failed':
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					失败
				</>
			);
		case 'Success':
			return (
				<>
					<Icon
						type="success1"
						size="xs"
						style={{ color: '#00A700' }}
					/>{' '}
					成功
				</>
			);
		default:
			return (
				<>
					<Icon
						type="minus-circle-fill"
						size="xs"
						style={{ color: '#FAC800' }}
					/>{' '}
					未知
				</>
			);
	}
};

// * 报警阈值中使用
export const alarmStatusRender: (value: string) => JSX.Element = (
	value: string
) => {
	switch (value) {
		case 'ok':
			return (
				<>
					<Icon
						type="success1"
						size="xs"
						style={{ color: '#00A700' }}
					/>{' '}
					正常
				</>
			);
		case 'unknown':
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					未知
				</>
			);
		case 'creating':
			return (
				<>
					<Icon
						type="sync-alt"
						size="xs"
						style={{ color: '#0091FF' }}
					/>{' '}
					创建中
				</>
			);
		case 'deleting':
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					删除中
				</>
			);
		default:
			return (
				<>
					<Icon
						type="warning1"
						size="xs"
						style={{ color: '#C80000' }}
					/>{' '}
					未知
				</>
			);
	}
};
// * 服务列表中使用
export const serviceListStatusRender: (
	value: string,
	index: number,
	record: any
) => JSX.Element = (value: string, index: number, record: any) => {
	switch (value) {
		case 'Creating':
			return (
				<>
					<Icon
						type="sync-alt"
						size="xs"
						style={{ color: '#0091FF' }}
					/>{' '}
					启动中
				</>
			);
		case 'Running':
			return (
				<>
					<Icon
						type="success1"
						size="xs"
						style={{ color: '#00A700' }}
					/>{' '}
					运行正常
				</>
			);
		case 'Failed':
			return (
				<Balloon
					trigger={
						<span style={{ cursor: 'pointer' }}>
							<Icon
								type="warning1"
								size="xs"
								style={{ color: '#C80000' }}
							/>{' '}
							运行异常
						</span>
					}
					closable={false}
				>
					中间件状态异常原因 <br />
					<span style={{ lineHeight: '18px', color: '#FA6400' }}>
						{record.reason}
					</span>
				</Balloon>
			);
		case 'RunningError':
			return (
				<Balloon
					trigger={
						<span style={{ cursor: 'pointer' }}>
							<Icon
								type="warning1"
								size="xs"
								style={{ color: '#C80000' }}
							/>{' '}
							运行异常
						</span>
					}
					closable={false}
				>
					中间件状态异常原因 <br />
					<span style={{ lineHeight: '18px', color: '#FA6400' }}>
						{record.reason}
					</span>
				</Balloon>
			);
		case '':
			return <></>;
		default:
			return (
				<Balloon
					trigger={
						<span style={{ cursor: 'pointer' }}>
							<Icon
								type="warning1"
								size="xs"
								style={{ color: '#C80000' }}
							/>{' '}
							运行异常
						</span>
					}
					closable={false}
				>
					中间件状态异常原因 <br />
					<span style={{ lineHeight: '18px', color: '#FA6400' }}>
						{record.reason}
					</span>
				</Balloon>
			);
	}
};
export const iconTypeRender = (value: string, index: number, record: any) => {
	return (
		<div className="icon-type-content">
			<img
				width={14}
				height={14}
				src={`${api}/images/middleware/${record.imagePath}`}
				alt={record.chartName}
			/>
			{value}
		</div>
	);
};
export const timeRender = (value: string, index: number, record: any) => {
	return moment(value).format('YYYY-MM-DD HH:mm:ss');
};
// * 简单表格列为空
export const nullRender: (value: string | null) => string = (
	value: string | null
) => {
	return value || '/';
};
// * 蓝字显示
export const nameRender = (value: string, index: number, record: any) => {
	return <span className="name-link">{value}</span>;
};

// * 函数复用
// * 判断两个数组中是否含有相同的元素（简单数组）
export const judgeArrays: (
	arr1: Array<string>,
	arr2: Array<string>
) => boolean = (arr1: Array<string>, arr2: Array<string>) => {
	const arr1Temp = Array.from(new Set(arr1));
	const arr2Temp = Array.from(new Set(arr2));
	const allArrays = [...arr1Temp, ...arr2Temp];
	const newArrays = Array.from(new Set(allArrays));
	return allArrays.length !== newArrays.length;
};
// * 公钥加密
export const encrypt = (text: string, publicKey: string) => {
	const encrypt = new JSEncrypt({});
	encrypt.setPublicKey(publicKey);
	const encrypted = encrypt.encrypt(text);
	return encrypted;
};
// * 判断某个对象数据的某些属性是否为空字符传
export const judgeObjArrayAttrIsNull: (
	arr: any[],
	...argument: any[]
) => boolean = (arr: any[] = [], ...argument: any[]) => {
	if (arr.length > 0) {
		let flag = false;
		argument.map((key) => {
			flag = arr.find((item) => item[key] === '');
		});
		if (flag) return true;
		return false;
	} else {
		return true;
	}
};
// * 对象数组属性值重复判断（根据某个字段进行判断）
export const judgeObjArrayHeavyByAttr: (arr: any[], attr: string) => boolean = (
	arr: any[],
	attr: string
) => {
	if (arr.length === 0) return false;
	const values = arr.map((item) => item[attr]);
	const t = Array.from(new Set(values));
	return values.length !== t.length;
};
// * 调换对象属性位置
export const changeObjectIndex: (obj: any, prop: string, index: number) => any =
	(obj: any, prop: string, index: number) => {
		const keyArr = Object.keys(obj);
		if (keyArr.length > 0) {
			const propIndex = keyArr.indexOf(prop);
			keyArr.splice(propIndex, 1);
			keyArr.splice(index, 0, prop);
			const result = {};
			for (let i = 0; i < keyArr.length; i++) {
				result[keyArr[i]] = obj[keyArr[i]];
			}
			return result;
		} else {
			return obj;
		}
	};
