import React, { useEffect, useState } from 'react';
import {
	Modal,
	Form,
	InputNumber,
	Checkbox,
	notification,
	TimePicker,
	Button
} from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import { useHistory } from 'react-router';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import Visualization from '../HighAvailability/visualization';
import storage from '@/utils/storage';
import {
	addBackupConfig,
	backupNow,
	updateBackupConfig
} from '@/services/backup';
import { getPods } from '@/services/middleware';
import { list } from '@/utils/const';
import { StoreState } from '@/types';
import { BackupRuleSendData, PodSendData } from '../detail';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import '../detail.scss';

const formItemLayout = {
	labelCol: {
		span: 2
	},
	wrapperCol: {
		span: 14
	}
};
const { confirm } = Modal;
const { Group: CheckboxGroup } = Checkbox;
function BackupSetting(): JSX.Element {
	const [form] = Form.useForm();
	// const field = Field.useField();
	const {
		clusterId,
		namespace,
		data: listData,
		isEdit,
		record,
		backup,
		selectObj,
		dataSecurity
	} = storage.getSession('detail');
	const history = useHistory();
	const [topoData, setTopoData] = useState();
	const [backupObj, setBackupObj] = useState();
	const [checks, setChecks] = useState<number[]>();
	const [allChecked, setAllChecked] = useState<boolean>();

	const onOk = () => {
		form.validateFields().then((values) => {
			onCreate(values);
		});
	};
	useEffect(() => {
		const sendData = {
			clusterId: clusterId,
			namespace: namespace,
			middlewareName: listData?.name,
			type: listData?.type
		};
		getPodList(sendData);
		// co·nst date = new Date(1, 1, );
		// date.setMinutes(record.cron
		// 	.split(' ? ? ')[0]
		// 	.split(' ')
		// 	.reverse()
		// 	.map((item: string) =>
		// 		item.length === 1 ? '0' + item : item
		// 	)[0]);
		// date.setSeconds(
		// 	record.cron
		// 		.split(' ? ? ')[0]
		// 		.split(' ')
		// 		.reverse()
		// 		.map((item: string) =>
		// 			item.length === 1 ? '0' + item : item
		// 		)[1]
		// )
		record &&
			setChecks(
				record.cron
					.split(' ? ? ')[1]
					.split(',')
					.map((item: string) => Number(item))
			);
		record &&
			record.cron
				.split(' ? ? ')[1]
				.split(',')
				.map((item: string) => Number(item))
				.join(',') === '0,1,2,3,4,5,6' &&
			setAllChecked(true);
		record &&
			form.setFieldsValue({
				count: record.limitRecord,
				cycle: record.cron
					.split(' ? ? ')[1]
					.split(',')
					.map((item: string) => Number(item)),
				time: moment(
					record.cron
						.split(' ? ? ')[0]
						.split(' ')
						.reverse()
						.map((item: string) =>
							item.length === 1 ? '0' + item : item
						)
						.join(':'),
					'HH:mm'
				)
			});
		record && setBackupObj(selectObj);
	}, []);

	useEffect(() => {
		return () => {
			storage.removeSession('detail');
		};
	}, []);

	// * 获取pod列表
	const getPodList = (sendData: PodSendData) => {
		getPods(sendData).then((res) => {
			if (res.success) {
				setTopoData(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const onCreate = (values: any) => {
		if (!backupObj) {
			notification.warning({
				message: '提示',
				description: '请选择实例对象'
			});
			return;
		}
		if (!isEdit) {
			const minute = moment(values.time).get('minute');
			const hour = moment(values.time).get('hour');
			const week = values.cycle.join(',');
			const cron = `${minute} ${hour} ? ? ${week}`;
			const sendData: BackupRuleSendData = {
				clusterId,
				namespace,
				middlewareName: listData.name,
				type: listData.type,
				limitRecord: values.count,
				cron:
					typeof values.time !== 'string'
						? cron
						: `${values.time.substring(
								3,
								5
						  )} ${values.time.substring(0, 2)} ? ? ${week}`
			};
			if (backupObj !== 'serve') sendData.pod = backupObj;
			addBackupConfig(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '备份设置成功'
					});
					if (dataSecurity) {
						history.push({
							pathname: '/disasterBackup/dataSecurity',
							state: {
								middlewareName: listData.name,
								middlewareType: listData.type
							}
						});
					} else {
						window.history.back();
					}
					localStorage.setItem('backupTab', 'config');
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		} else {
			if (record) {
				const minute = moment(values.time).get('minute');
				const hour = moment(values.time).get('hour');
				const week = values.cycle.join(',');
				const cron = `${minute} ${hour} ? ? ${week}`;
				const sendData: BackupRuleSendData = {
					clusterId,
					namespace,
					backupScheduleName: record.backupScheduleName,
					type: listData.type,
					limitRecord: values.count,
					cron:
						typeof values.time !== 'string'
							? cron
							: `${values.time.substring(
									3,
									5
							  )} ${values.time.substring(0, 2)} ? ? ${week}`
				};
				updateBackupConfig(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '备份修改成功'
						});
						if (dataSecurity) {
							history.push({
								pathname: '/disasterBackup/dataSecurity',
								state: {
									middlewareName: listData.name,
									middlewareType: listData.type
								}
							});
						} else {
							window.history.back();
						}
						localStorage.setItem('backupTab', 'config');
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				const sendData: BackupRuleSendData = {
					clusterId,
					namespace,
					backupName: backup.backupName,
					type: listData.type,
					middlewareName: listData.name,
					backupFileName: backup.backupFileName
				};
				if (backupObj !== 'serve') {
					sendData.pod = backupObj;
				} else {
					sendData.pod = listData.pods.map(
						(item: any) => item.podName
					);
				}
				confirm({
					title: '操作确认',
					content: '请确认是否覆盖？',
					onOk: () => {
						backupNow(sendData).then((res) => {
							if (res.success) {
								notification.success({
									message: '成功',
									description: '备份恢复成功，5秒之后跳转'
								});
								setTimeout(() => {
									if (dataSecurity) {
										history.push({
											pathname:
												'/disasterBackup/dataSecurity',
											state: {
												middlewareName: listData.name,
												middlewareType: listData.type
											}
										});
									} else {
										window.history.back();
									}
									localStorage.setItem('backupTab', 'list');
								}, 5000);
							} else {
								notification.error({
									message: '失败',
									description: res.errorMsg
								});
							}
						});
					}
				});
			}
		}
	};

	return (
		<ProPage>
			<ProHeader
				title={!isEdit ? '新建备份' : backup ? '恢复备份' : '修改备份'}
				// hasBackArrow
				onBack={() => {
					if (dataSecurity) {
						history.push({
							pathname: '/disasterBackup/dataSecurity',
							state: {
								middlewareName: listData.name,
								middlewareType: listData.type
							}
						});
					} else {
						window.history.back();
					}
					localStorage.setItem(
						'backupTab',
						backup && isEdit ? 'list' : 'config'
					);
				}}
				// renderBackArrow={(elem) => (
				// 	<span
				// 		className="details-go-back"
				// 		onClick={() => {
				// 		}}
				// 	>
				// 		{elem}
				// 	</span>
				// )}
			/>
			<ProContent>
				{topoData && (
					<Visualization
						serverData={listData}
						topoData={topoData}
						backupObj={backupObj}
						setBackupObj={(value: any) => setBackupObj(value)}
						isEdit={isEdit}
						selectObj={selectObj}
						backup={backup}
						record={record}
					/>
				)}
				{!isEdit || record ? (
					<Form
						{...formItemLayout}
						form={form}
						style={{ marginTop: '24px' }}
					>
						<Form.Item
							label="备份保留个数"
							required
							name="count"
							rules={[
								{
									required: true,
									message: '备份保留个数不能为空'
								},
								{
									min: 1,
									type: 'number',
									message: '备份保留个数最小值为1'
								}
							]}
							// requiredMessage="备份保留个数不能为空"
							// min={1}
							// minmaxLengthMessage="备份保留个数最小值为1"
							initialValue={1}
						>
							<InputNumber
								// min={1}
								// defaultValue={1}
								type="inline"
							/>
						</Form.Item>
						<Form.Item
							label="备份周期"
							className="check-form"
							required
						>
							<Form.Item>
								<Checkbox
									style={{ marginRight: '12px' }}
									onChange={(value: CheckboxChangeEvent) => {
										value.target.checked
											? setChecks([0, 1, 2, 3, 4, 5, 6])
											: setChecks([]);
										value.target.checked
											? form.setFieldsValue({
													cycle: [0, 1, 2, 3, 4, 5, 6]
											  })
											: form.setFieldsValue({
													cycle: []
											  });
										form.validateFields(['cycle']);
										setAllChecked(value.target.checked);
									}}
									checked={allChecked}
								>
									全选
								</Checkbox>
							</Form.Item>
							<Form.Item
								name="cycle"
								rules={[
									{
										required: true,
										message: '备份周期不能为空！'
									}
								]}
							>
								<CheckboxGroup
									options={list}
									value={checks}
									onChange={(value: CheckboxValueType[]) => {
										setChecks(value as number[]);
										(value as number[])
											.sort(
												(a: number, b: number) => a - b
											)
											.join(',') === '0,1,2,3,4,5,6'
											? setAllChecked(true)
											: setAllChecked(false);
									}}
								/>
							</Form.Item>
						</Form.Item>
						<Form.Item
							label="备份时间"
							required
							name="time"
							rules={[
								{ required: true, message: '备份时间不能为空' }
							]}
							// requiredMessage="备份时间不能为空"
						>
							<TimePicker
								showNow={false}
								minuteStep={30}
								format="HH:mm"
							/>
						</Form.Item>
					</Form>
				) : null}
				{!isEdit || record ? (
					<div
						style={{
							padding: '16px 9px',
							boxShadow: '0px -1px 0px 0px #E3E4E6'
						}}
					>
						<Button
							onClick={onOk}
							type="primary"
							style={{ marginRight: '9px' }}
						>
							确定
						</Button>
						<Button
							onClick={() => {
								if (dataSecurity) {
									history.push({
										pathname:
											'/disasterBackup/dataSecurity',
										state: {
											middlewareName: listData.name,
											middlewareType: listData.type
										}
									});
								} else {
									window.history.back();
								}
								localStorage.setItem('backupTab', 'config');
							}}
						>
							取消
						</Button>
					</div>
				) : (
					<div style={{ padding: '16px 9px' }}>
						{listData.type === 'mysql' && (
							<Button
								onClick={() => {
									if (!backupObj) {
										notification.warning({
											message: '提示',
											description: '请选择实例对象'
										});
										return;
									} else {
										if (backup.phrase !== 'Success') {
											notification.error({
												message: '错误',
												description:
													'该服务还没备份完成'
											});
										} else {
											history.push(
												`/serviceList/mysql/MySQL/mysqlCreate/${listData.chartVersion}/${listData.name}/${backup.backupFileName}`
											);
										}
									}
								}}
								type="primary"
								style={{ marginRight: '9px' }}
							>
								克隆
							</Button>
						)}
						<Button
							onClick={onOk}
							type="primary"
							style={{ marginRight: '9px' }}
						>
							覆盖
						</Button>
						<Button
							onClick={() => {
								if (dataSecurity) {
									history.push({
										pathname:
											'/disasterBackup/dataSecurity',
										state: {
											middlewareName: listData.name,
											middlewareType: listData.type
										}
									});
								} else {
									window.history.back();
								}
								localStorage.setItem('backupTab', 'list');
							}}
						>
							取消
						</Button>
					</div>
				)}
			</ProContent>
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(BackupSetting);
