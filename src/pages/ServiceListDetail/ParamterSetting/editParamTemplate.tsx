import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { connect } from 'react-redux';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import { Button, Form, Input, notification, Steps, Result } from 'antd';
import FormBlock from '@/components/FormBlock';
import ParamEditTable from './components/paramEditTable';
import {
	setParamTemplateBasic,
	setParamTemplateConfig,
	setParamTemplateBasicClear,
	setParamTemplateConfigClear
} from '@/redux/param/param';
import {
	createParamsTemp,
	getParamsTemp,
	editParamsTemp
} from '@/services/template';

import pattern from '@/utils/pattern';
import { formItemLayout614 } from '@/utils/const';
import { StoreState } from '@/types';
import { EditParamTemplateProps } from '../detail';

const { Step } = Steps;
export interface ParamsProps {
	type: string;
	chartVersion: string;
	middlewareName: string;
	uid: string;
	templateName: string;
	name: string;
	aliasName: string;
	currentTab: string;
	namespace: string;
}

const FormItem = Form.Item;
function EditParamTemplate(props: EditParamTemplateProps): JSX.Element {
	const {
		type,
		chartVersion,
		middlewareName,
		uid,
		templateName,
		name,
		aliasName,
		namespace
	}: ParamsProps = useParams();
	const {
		param,
		globalVar: {
			cluster: { id: clusterId }
		},
		setParamTemplateBasic,
		setParamTemplateConfig,
		setParamTemplateBasicClear,
		setParamTemplateConfigClear
	} = props;
	const [current, setCurrent] = useState<number>(0);
	const [btnDisable, setBtnDisable] = useState<boolean>(false);
	const [fixFlag, setFixFlag] = useState<boolean>(false);
	const [countdown, setCountDown] = useState<number>(5);
	const [form] = Form.useForm();
	const history = useHistory();
	useEffect(() => {
		return () => {
			setParamTemplateBasicClear();
			setParamTemplateConfigClear();
		};
	}, []);
	useEffect(() => {
		let timer: any = null;
		if (current === 0) {
			console.log(param);
			form.setFieldsValue({
				name: param.name,
				description: param.description
			});
		}
		if (current === 2 || current === 3) {
			if (countdown !== -1) {
				let count = countdown;
				timer = setInterval(() => {
					if (count === -1) {
						clearInterval(timer);
						timer = null;
						history.push(
							`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}/${namespace}`
						);
						console.log('???????????????');
					} else {
						setCountDown(count--);
					}
				}, 1000);
			}
		}
		return () => {
			clearInterval(timer);
		};
	}, [current]);
	useEffect(() => {
		if (uid) {
			const sendData = {
				uid,
				type,
				chartVersion
			};
			getParamsTemp(sendData).then((res) => {
				if (res.success) {
					setParamTemplateBasic({
						name: res.data.name,
						description: res.data.description
					});
					setParamTemplateConfig(res.data.customConfigList);
				} else {
					notification.error({
						message: '??????',
						description: res.errorMsg
					});
				}
			});
		}
	}, [uid]);
	// useEffect(() => {
	// 	console.log(props.param);
	// 	form.setFieldsValue({
	// 		name: param.name,
	// 		description: param.description
	// 	});
	// }, [props.param]);
	useEffect(() => {
		const content =
			document.getElementsByClassName('windcc-app-layout__content')[0]
				?.clientHeight - 147;
		const OneArea = document.getElementsByClassName(
			'param-step-one-content'
		)[0]?.clientHeight;
		const twoArea = document.getElementsByClassName(
			'zeus-param-edit-table-content'
		)[0]?.clientHeight;
		if (current === 0) {
			if (content > OneArea) {
				setFixFlag(false);
			} else {
				setFixFlag(true);
			}
		} else {
			if (content > twoArea) {
				setFixFlag(false);
			} else {
				setFixFlag(true);
			}
		}
		window.onresize = function () {
			const content =
				document.getElementsByClassName('windcc-app-layout__content')[0]
					?.clientHeight - 147;
			const OneArea = document.getElementsByClassName(
				'param-step-one-content'
			)[0]?.clientHeight;
			const twoArea = document.getElementsByClassName(
				'zeus-param-edit-table-content'
			)[0]?.clientHeight;
			if (content > OneArea) {
				setFixFlag(false);
			} else if (content > twoArea) {
				setFixFlag(false);
			} else {
				setFixFlag(true);
			}
		};
	}, [
		document.getElementsByClassName('zeus-param-edit-table-content')[0]
			?.clientHeight,
		document.getElementsByClassName('param-step-one-content')[0]
			?.clientHeight
	]);
	const goLast = () => {
		setCurrent(current - 1);
		if (current - 1 === 0) {
			console.log(param);
			form.setFieldsValue({
				name: param.name,
				description: param.description
			});
		}
	};
	const goNext = () => {
		if (current === 0) {
			form.validateFields().then((values) => {
				setParamTemplateBasic(values);
				setCurrent(current + 1);
			});
		}
		if (current === 1) {
			setCurrent(current + 1);
			if (uid) {
				// * ????????????
				const customTemp = param.customConfigList.map((item) => {
					item.value = item.modifiedValue;
					return item;
				});
				const sendData = {
					name: param.name,
					description: param.description,
					customConfigList: customTemp,
					type,
					uid
				};
				editParamsTemp(sendData).then((res) => {
					if (res.success) {
						setCurrent(2);
					} else {
						setCurrent(3);
					}
				});
			} else {
				// * ????????????
				const customTemp = param.customConfigList.map((item) => {
					item.value = item.modifiedValue;
					return item;
				});
				const sendData = {
					name: param.name,
					description: param.description,
					customConfigList: customTemp,
					type
				};
				createParamsTemp(sendData).then((res) => {
					console.log(res);
					if (res.success) {
						setCurrent(2);
					} else {
						setCurrent(3);
					}
				});
			}
		}
	};
	const childrenRender = (value: number) => {
		switch (value) {
			case 0:
				return (
					<FormBlock
						title="????????????"
						className="param-step-one-content"
					>
						<Form
							form={form}
							{...formItemLayout614}
							labelAlign="left"
							style={{ paddingLeft: 8, width: '50%' }}
						>
							<FormItem
								label="????????????"
								required
								name="name"
								rules={[
									{
										pattern: new RegExp(
											pattern.paramTemplateName
										),
										message:
											'????????????????????????????????????-????????????2-30?????????'
									},
									{
										required: true,
										message: '?????????????????????'
									}
								]}
							>
								<Input
									minLength={2}
									maxLength={30}
									placeholder="????????????????????????????????????-????????????2-30?????????"
								/>
							</FormItem>
							<FormItem
								label="????????????"
								name="description"
								rules={[
									{
										max: 100,
										message: '??????????????????????????????100??????'
									}
								]}
							>
								<Input.TextArea
									placeholder="?????????????????????"
									maxLength={100}
									showCount
								/>
							</FormItem>
						</Form>
					</FormBlock>
				);
			case 1:
				return (
					<ParamEditTable
						clusterId={clusterId}
						namespace={namespace}
						middlewareName={middlewareName}
						type={type}
						handleBtnClick={setBtnDisable}
					/>
				);
			case 2:
				return (
					<Result
						className="zeus-params"
						status="success"
						title={
							uid ? '???????????????????????????!' : '???????????????????????????!'
						}
						extra={
							<Button
								type="primary"
								onClick={() => {
									history.push(
										`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}/${namespace}`
									);
									setParamTemplateBasicClear();
									setParamTemplateConfigClear();
								}}
							>
								????????????({countdown}s)
							</Button>
						}
					>
						<div className="zeus-param-display-area-content">
							<div className="title-content">
								<div className="blue-line"></div>
								<div className="detail-title">????????????</div>
							</div>
							<ul className="zeus-param-display-info">
								<li>
									<label>????????????</label>
									<span>{param.name}</span>
								</li>
								<li>
									<label>??????</label>
									<span title={param.description}>
										{param.description}
									</span>
								</li>
							</ul>
						</div>
					</Result>
				);
			case 3:
				return (
					<Result
						status="error"
						title={uid ? '??????????????????' : '??????????????????'}
						extra={
							<Button
								type="primary"
								onClick={() => {
									history.push(
										`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}/${namespace}`
									);
									setParamTemplateBasicClear();
									setParamTemplateConfigClear();
								}}
							>
								??????????????????({countdown}s)
							</Button>
						}
					/>
				);
			default:
				break;
		}
	};
	return (
		<ProPage>
			<ProHeader
				title={uid ? '??????????????????' : '??????????????????'}
				onBack={() => {
					window.history.back();
					setParamTemplateBasicClear();
					setParamTemplateConfigClear();
				}}
			/>
			<ProContent className="param-content">
				<Steps
					style={{ marginBottom: 32 }}
					current={current}
					labelPlacement="horizontal"
				>
					<Step key={0} title="????????????" />
					<Step key={1} title="???????????????" />
					<Step key={2} title="??????" />
				</Steps>
				{childrenRender(current)}
				{(current === 0 || current === 1) && (
					<div
						className={`zeus-edit-param-summit-btn ${
							fixFlag ? 'zeus-edit-param-summit-btn-fix' : ''
						}`}
						style={{
							background: btnDisable ? '#F8F8F9' : '#ffffff',
							cursor: btnDisable ? 'not-allowed' : 'auto'
						}}
					>
						{current === 1 && (
							<Button
								disabled={btnDisable}
								type="default"
								onClick={goLast}
							>
								?????????
							</Button>
						)}
						<Button
							disabled={btnDisable}
							type="primary"
							onClick={goNext}
						>
							?????????
						</Button>
						<Button
							disabled={btnDisable}
							type="default"
							onClick={() => {
								window.history.back();
								setParamTemplateBasicClear();
								setParamTemplateConfigClear();
							}}
						>
							??????
						</Button>
					</div>
				)}
			</ProContent>
		</ProPage>
	);
}
const mapStateToProps = (state: StoreState) => ({
	param: state.param,
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {
	setParamTemplateBasic,
	setParamTemplateConfig,
	setParamTemplateBasicClear,
	setParamTemplateConfigClear
})(EditParamTemplate);
