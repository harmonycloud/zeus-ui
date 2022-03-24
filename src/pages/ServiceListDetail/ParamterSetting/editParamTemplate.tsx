import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import { Page, Header, Content } from '@alicloud/console-components-page';
import {
	Step,
	Button,
	Form,
	Input,
	Field,
	Message
} from '@alicloud/console-components';
import { connect } from 'react-redux';
import FormBlock from '@/components/FormBlock';
import ParamEditTable from './components/paramEditTable';
import ErrorPage from '@/components/ResultPage/ErrorPage';

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
import { EditParamTemplateProps, ParamterTemplateItem } from '../detail';
import messageConfig from '@/components/messageConfig';
import SuccessPage from '@/components/ResultPage/SuccessPage';

export interface ParamsProps {
	type: string;
	chartVersion: string;
	middlewareName: string;
	uid: string;
	templateName: string;
	name: string;
	aliasName: string;
	currentTab: string;
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
		aliasName
	}: ParamsProps = useParams();
	const {
		param,
		globalVar: {
			cluster: { id: clusterId },
			namespace: { name: namespace }
		},
		setParamTemplateBasic,
		setParamTemplateConfig,
		setParamTemplateBasicClear,
		setParamTemplateConfigClear
	} = props;
	console.log(param);
	const [current, setCurrent] = useState<number>(0);
	const [btnDisable, setBtnDisable] = useState<boolean>(false);
	const [fixFlag, setFixFlag] = useState<boolean>(false);
	const field = Field.useField();
	const history = useHistory();
	useEffect(() => {
		return () => {
			setParamTemplateBasicClear();
			setParamTemplateConfigClear();
		};
	}, []);
	useEffect(() => {
		if (uid) {
			const sendData = {
				uid,
				type,
				chartVersion
			};
			getParamsTemp(sendData).then((res) => {
				console.log(res);
				if (res.success) {
					setParamTemplateBasic({
						name: res.data.name,
						description: res.data.description
					});
					setParamTemplateConfig(res.data.customConfigList);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	}, [uid]);
	useEffect(() => {
		field.setValues({ name: param.name, description: param.description });
	}, [props.param]);
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
	const goNext = () => {
		if (current === 0) {
			field.validate((error) => {
				if (error) return;
				setParamTemplateBasic(field.getValues());
				setCurrent(current + 1);
			});
		}
		if (current === 1) {
			setCurrent(current + 1);
			if (uid) {
				// * 更新模版
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
				// * 创建模版
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
						title="基础信息"
						className="param-step-one-content"
					>
						<Form
							{...formItemLayout614}
							field={field}
							style={{ paddingLeft: 8, width: '50%' }}
						>
							<FormItem
								label="模板名称"
								required
								labelTextAlign="left"
								asterisk={false}
								className="ne-required-ingress"
								pattern={pattern.paramTemplateName}
								maxLength={30}
								minmaxLengthMessage="请输入由小写字母数字及“-”组成的2-30个字符"
								min={2}
								patternMessage="请输入由小写字母数字及“-”组成的2-30个字符"
								requiredMessage="请输入模板名称"
							>
								<Input
									minLength={2}
									maxLength={30}
									name="name"
									placeholder="请输入由小写字母数字及“-”组成的2-30个字符"
								/>
							</FormItem>
							<FormItem
								label="模板描述"
								required
								labelTextAlign="left"
								asterisk={false}
								className="ne-required-ingress"
								minmaxLengthMessage="模板描述长度不可超过100字符"
								maxLength={100}
								requiredMessage="请输入模板描述"
							>
								<Input.TextArea
									placeholder="请输入模板描述"
									name="description"
									maxLength={100}
									showLimitHint
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
					<div
						style={{
							height: '100%',
							textAlign: 'center',
							marginTop: 54
						}}
					>
						<SuccessPage
							title={
								uid
									? '恭喜，模版修改完成!'
									: '恭喜，模版创建完成!'
							}
							leftText={`返回列表`}
							countDown={5}
							leftHandle={() => {
								history.push(
									`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}`
								);
								setParamTemplateBasicClear();
								setParamTemplateConfigClear();
							}}
							rightBtn={false}
						>
							<div className="zeus-param-display-area-content">
								<div className="title-content">
									<div className="blue-line"></div>
									<div className="detail-title">基础信息</div>
								</div>
								<ul className="zeus-param-display-info">
									<li>
										<label>模版名称</label>
										<span>{param.name}</span>
									</li>
									<li>
										<label>描述</label>
										<span title={param.description}>
											{param.description}
										</span>
									</li>
								</ul>
							</div>
						</SuccessPage>
					</div>
				);
			case 3:
				return (
					<div
						style={{
							height: '100%',
							textAlign: 'center',
							marginTop: 54
						}}
					>
						<ErrorPage
							title={uid ? '模版修改失败' : '模版创建失败'}
							btnText={`返回创建列表`}
							countDown={5}
							btnHandle={() => {
								history.push(
									`/serviceList/${name}/${aliasName}/paramterSetting/${middlewareName}/${type}/${chartVersion}`
								);
								setParamTemplateBasicClear();
								setParamTemplateConfigClear();
							}}
						/>
					</div>
				);
			default:
				break;
		}
	};
	return (
		<Page>
			<Header
				title={uid ? '修改参数模版' : '新建参数模版'}
				hasBackArrow
				onBackArrowClick={() => {
					window.history.back();
					setParamTemplateBasicClear();
					setParamTemplateConfigClear();
				}}
			/>
			<Content className="param-content">
				<Step
					style={{ marginBottom: 32 }}
					current={current}
					shape="circle"
					labelPlacement="hoz"
				>
					<Step.Item key={0} title="基础信息" />
					<Step.Item key={1} title="自定义参数" />
					<Step.Item key={2} title="完成" />
				</Step>
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
								type="normal"
								onClick={() => setCurrent(current - 1)}
							>
								上一步
							</Button>
						)}
						<Button
							disabled={btnDisable}
							type="primary"
							onClick={goNext}
						>
							下一步
						</Button>
						<Button
							disabled={btnDisable}
							type="normal"
							onClick={() => {
								window.history.back();
								setParamTemplateBasicClear();
								setParamTemplateConfigClear();
							}}
						>
							取消
						</Button>
					</div>
				)}
			</Content>
		</Page>
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
