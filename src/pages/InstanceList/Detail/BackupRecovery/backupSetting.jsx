import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	NumberPicker,
	Checkbox,
	TimePicker,
	Message
} from '@alicloud/console-components';
import Visualization from '../HighAvailability/visualization';
import moment from 'moment';
import { connect, useStore } from 'react-redux';
import messageConfig from '@/components/messageConfig';
import storage from '@/utils/storage';
import { addBackupConfig, backupNow, updateBackupConfig } from '@/services/backup';
import { Page, Content } from '@alicloud/console-components-page';
import { getPods } from '@/services/middleware';
import { useHistory } from 'react-router';
import { Button } from '@alifd/next';

const formItemLayout = {
	labelCol: {
		span: 2
	},
	wrapperCol: {
		span: 14
	}
};
const list = [
	{ value: 1, label: '星期一' },
	{ value: 2, label: '星期二' },
	{ value: 3, label: '星期三' },
	{ value: 4, label: '星期四' },
	{ value: 5, label: '星期五' },
	{ value: 6, label: '星期六' },
	{ value: 0, label: '星期日' }
];
const listMap = {
	星期一: 1,
	星期二: 2,
	星期三: 3,
	星期四: 4,
	星期五: 5,
	星期六: 6,
	星期日: 0
};
const { Group: CheckboxGroup } = Checkbox;
function BackupSetting(props) {
	const field = Field.useField();
	const { clusterId, namespace, data: listData, isEdit, record, backup, selectObj } = storage.getSession('detail');
	const [topoData, setTopoData] = useState();
	const [backupData, setBackupData] = useState({
		configed: false,
		limitRecord: 0,
		cycle: '',
		time: '',
		nextBackupTime: '',
		pause: 'on',
		canPause: true
	});
	const history = useHistory();
	const [backupObj, setBackupObj] = useState();
	const [checks, setChecks] = useState();
	const [allChecked, setAllChecked] = useState();

	const onOk = () => {
		field.validate((error, values) => {
			if (!error) {
				onCreate(values);
			}
		});
	};
	useEffect(() => {
		const sendData = {
			clusterId: clusterId,
			namespace: namespace,
			middlewareName: listData.name,
			type: listData.type
		};
		getPodList(sendData);
		record && setChecks(record.cron.split(' ? ? ')[1].split(',').map((item) => Number(item)));
		record && record.cron.split(' ? ? ')[1].split(',').map(item => Number(item)).join(',') === '0,1,2,3,4,5,6' && setAllChecked(true);
		record &&
			field.setValues({
				count: record.limitRecord,
				cycle: record.cron
					.split(' ? ? ')[1]
					.split(',')
					.map((item) => Number(item)),
				time: record.cron
					.split(' ? ? ')[0]
					.split(' ')
					.reverse()
					.map((item) => (item.length === 1 ? '0' + item : item))
					.join(':')
			});
	}, []);

	useEffect(() => {
		return () => {
			storage.removeSession('detail');
		};
	}, []);

	// * 获取pod列表
	const getPodList = (sendData) => {
		getPods(sendData).then((res) => {
			if (res.success) {
				setTopoData(res.data.podInfoGroup);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const onCreate = (values) => {
		if (!backupObj) {
			Message.show(messageConfig('warning', '提示', '请选择实例对象'));
			return;
		}
		if (!isEdit) {
			const minute = moment(values.time).get('minute');
			const hour = moment(values.time).get('hour');
			const week = values.cycle.join(',');
			const cron = `${minute} ${hour} ? ? ${week}`;
			const sendData = {
				clusterId,
				namespace,
				middlewareName: listData.name,
				type: listData.type,
				limitRecord: values.count,
				cron: (typeof values.time !== 'string') ? cron : `${values.time.substring(3, 5)} ${values.time.substring(0, 2)} ? ? ${week}`
			};
			if (backupObj !== 'serve') sendData.pod = backupObj;
			addBackupConfig(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '备份设置成功')
						);
						history.push('/disasterBackup/dataSecurity');
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				})
		} else {
			if (record) {
				const minute = moment(values.time).get('minute');
				const hour = moment(values.time).get('hour');
				const week = values.cycle.join(',');
				const cron = `${minute} ${hour} ? ? ${week}`;
				const sendData = {
					clusterId,
					namespace,
					backupScheduleName: record.backupScheduleName,
					type: listData.type,
					limitRecord: values.count,
					cron: (typeof values.time !== 'string') ? cron : `${values.time.substring(3, 5)} ${values.time.substring(0, 2)} ? ? ${week}`
				};
				updateBackupConfig(sendData)
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', '备份修改成功')
							);
							history.push('/disasterBackup/dataSecurity');
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
			} else {
				const sendData = {
					clusterId,
					namespace,
					backupName: backup.backupName,
					type: listData.type,
					middlewareName: listData.name,
					backupFileName: backup.backupFileName,
				};
				if (backupObj !== 'serve') {
					sendData.pod = backupObj;
				} else {
					sendData.pod = listData.pods.map(item => item.podName);
				}
				backupNow(sendData)
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', '备份恢复成功')
							);
							history.push('/disasterBackup/dataSecurity');
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
			}
		}
	};

	return (
		<Page>
			<Content>
				{topoData && (
					<Visualization
						serverData={listData}
						topoData={topoData}
						backupObj={backupObj}
						setBackupObj={(value) => setBackupObj(value)}
						isEdit={isEdit}
						selectObj={selectObj}
						backup={backup}
					/>
				)}
				{
					!isEdit || record ? <Form {...formItemLayout} field={field} style={{ marginTop: '24px' }}>
						<Form.Item
							label="备份保留个数"
							required
							requiredMessage="备份保留个数不能为空"
							min={1}
							minmaxLengthMessage="备份保留个数最小值为1"
						>
							<NumberPicker
								min={1}
								defaultValue={1}
								type="inline"
								name="count"
							/>
						</Form.Item>
						<Form.Item
							label="备份周期"
							required
							requiredMessage="备份周期不能为空！"
						>
							<Checkbox
								label="全选"
								style={{ marginRight: '12px' }}
								onChange={(value) => {
									value ? setChecks([0, 1, 2, 3, 4, 5, 6]) : setChecks();
									setAllChecked(value);
								}}
								checked={allChecked}
							/>
							<CheckboxGroup
								name="cycle"
								dataSource={list}
								value={checks}
								onChange={(value) => {
									setChecks(value)
									value.sort((a, b) => a - b).join(',') === '0,1,2,3,4,5,6' ? setAllChecked(true) : setAllChecked(false);
								}} />
						</Form.Item>
						<Form.Item
							label="备份时间"
							required
							requiredMessage="备份时间不能为空"
						>
							<TimePicker
								name="time"
								minuteStep={30}
								format="HH:mm"
							/>
						</Form.Item>
					</Form> : null
				}
				{
					!isEdit || record ? <div style={{ padding: '16px 9px', boxShadow: '0px -1px 0px 0px #E3E4E6' }}>
						<Button onClick={onOk} type="primary" style={{ marginRight: '9px' }}>确定</Button>
						<Button
							onClick={() => {
								field.reset();
								setChecks();
							}}
						>
							取消
						</Button>
					</div> :
						<div style={{ padding: '16px 9px' }}>
							{listData.type === 'mysql' && <Button onClick={() => history.push('/serviceList/mysqlCreate/MySQL/mysql/' + listData.chartVersion)} type="primary" style={{ marginRight: '9px' }}>克隆</Button>}
							<Button onClick={onOk} type="primary" style={{ marginRight: '9px' }}>覆盖</Button>
							<Button
								onClick={() => {
									field.reset();
									setChecks();
								}}
							>
								取消
							</Button>
						</div>
				}
			</Content>
		</Page>
	);
}
export default connect(({ globalVar }) => ({ globalVar }), {})(BackupSetting);
