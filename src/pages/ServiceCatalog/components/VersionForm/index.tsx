import SelectBlock from '@/components/SelectBlock';
import { getMiddlewareVersions } from '@/services/common';
import { AutoCompleteOptionItem } from '@/types/comment';
import { notification } from 'antd';
import React, { useEffect, useState } from 'react';
interface VersionFormProps {
	type: string;
	chartVersion: string;
	disabled?: boolean;
	version: string;
	setVersion: (value: string) => void;
}
export default function VersionForm(props: VersionFormProps): JSX.Element {
	const { type, chartVersion, disabled, version, setVersion } = props;
	const [versionOriginData, setVersionOriginData] = useState({});
	const [fatherVersion, setFatherVersion] = useState<string>('');
	const [versionList, setVersionList] = useState<AutoCompleteOptionItem[]>(
		[]
	);
	const [versionFatherList, setVersionFatherList] = useState<
		AutoCompleteOptionItem[]
	>([]);
	useEffect(() => {
		getMiddlewareVersions({
			type,
			chartVersion
		}).then((res) => {
			if (res.success) {
				if (res.data) {
					setVersionOriginData(res.data);
					const list = Object.keys(res.data);
					if (version) {
						setFatherVersion(version.split('.')[0]);
						setVersionList(
							res.data[version.split('.')[0]].map(
								(item: string) => {
									return { value: item, label: item };
								}
							)
						);
						setVersion(version);
					} else {
						setFatherVersion(list[0]);
						setVersion(res.data[list[0]][0]);
						setVersionList(
							res.data[list[0]].map((item: string) => {
								return { value: item, label: item };
							})
						);
					}
					const lt = list.map((item: string) => {
						return { value: item, label: item };
					});
					setVersionFatherList(lt);
				} else {
					notification.error({
						message: '错误',
						description: '没有获取到当前中间件版本'
					});
				}
			}
		});
	}, []);
	return (
		<>
			<li className="display-flex form-li">
				<label className="form-name">
					<span>版本</span>
				</label>
				<div className={`form-content display-flex`}>
					<SelectBlock
						options={versionFatherList}
						currentValue={fatherVersion}
						onCallBack={(value: any) => {
							setFatherVersion(value);
							setVersionList(
								versionOriginData[value].map((item: string) => {
									return {
										value: item,
										label: item
									};
								})
							);
							setVersion('');
						}}
						disabled={disabled}
					/>
				</div>
			</li>
			<li className="display-flex form-li">
				<label className="form-name">
					<span></span>
				</label>
				<div className={`form-content display-flex`}>
					<SelectBlock
						options={versionList}
						currentValue={version}
						onCallBack={(value: any) => setVersion(value)}
						disabled={disabled}
					/>
				</div>
			</li>
		</>
	);
}
