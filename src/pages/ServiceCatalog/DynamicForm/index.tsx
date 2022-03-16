import React, { useEffect, useState } from 'react';
import Page from '@alicloud/console-components-page';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import {
	Form,
	Field,
	Button,
	Message,
	Input
} from '@alicloud/console-components';
import FormBlock from '@/components/FormBlock';
import { renderFormItem } from '@/components/renderFormItem';
// * 结果页相关-start
import LoadingPage from '@/components/ResultPage/LoadingPage';
import SuccessPage from '@/components/ResultPage/SuccessPage';
import ErrorPage from '@/components/ResultPage/ErrorPage';
// * 结果页相关-end
import { getDynamicFormData } from '@/services/middleware';
import { postMiddleware } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { getMirror } from '@/services/common';

import {
	CreateProps,
	DynamicSendDataParams,
	DynamicCreateValueParams
} from '../catalog';
import { StoreState } from '@/types';
const { Item: FormItem } = Form;

const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};

function DynamicForm(props: CreateProps): JSX.Element {
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const {
		params: { chartName, chartVersion, version, aliasName }
	} = props.match;
	const [dataSource, setDataSource] = useState<any>();
	const [capabilities, setCapabilities] = useState<string[]>([]);
	// * 是否点击提交跳转至结果页
	const [commitFlag, setCommitFlag] = useState<boolean>(false);
	// * 发布成功
	const [successFlag, setSuccessFlag] = useState<boolean>(false);
	// * 发布失败
	const [errorFlag, setErrorFlag] = useState<boolean>(false);
	// * 创建返回的服务名称
	const [createData, setCreateData] = useState<string>();
	const [mirrorList, setMirrorList] = useState<any[]>([]);
	const history = useHistory();
	const field = Field.useField();
	useEffect(() => {
		if (
			JSON.stringify(props.globalVar.cluster) !== '{}' &&
			JSON.stringify(props.globalVar.namespace) !== '{}'
		) {
			const sendData = {
				clusterId: globalCluster.id,
				chartName: chartName,
				chartVersion: chartVersion
			};
			getDynamicFormData(sendData).then((res) => {
				if (res.success) {
					const formatData = processData(res.data.questions);
					setDataSource(formatData);
					setCapabilities(res.data.capabilities);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
			getMirror({
				clusterId: globalCluster.id,
			}).then((res) => {
				if (res.success) {
					setMirrorList(res.data.list);
				}
			});
		}
	}, [props]);

	const processData = (array: any) => {
		const obj = {};
		array.forEach((item: any) => {
			obj[item.group] = [];
		});
		array.forEach((item: any) => {
			if (Object.keys(obj).includes(item.group)) {
				obj[item.group].push(item);
			}
		});
		return obj;
	};

	const childrenRender = (values: any) => {
		if (values) {
			const keys = Object.keys(values);
			return (
				<div>
					{keys.map((item) => {
						return (
							<FormBlock key={item} title={item}>
								<div className="w-50">
									<ul className="form-layout">
										{values[item].map((formItem: any) => {
											return (
												<React.Fragment
													key={formItem.variable}
												>
													{renderFormItem(
														formItem,
														field,
														globalCluster,
														globalNamespace
													)}
												</React.Fragment>
											);
										})}
									</ul>
								</div>
							</FormBlock>
						);
					})}
				</div>
			);
		}
	};

	const handleSubmit = () => {
		field.validate((err) => {
			if (err) return;
			const values: DynamicCreateValueParams = field.getValues();
			const sendData: DynamicSendDataParams = {
				clusterId: globalCluster.id,
				namespace: globalNamespace.name,
				type: chartName,
				chartName: chartName,
				chartVersion: chartVersion,
				version: values.version,
				name: values.name,
				aliasName: values.aliasName,
				description: values.description,
				labels: values.labels,
				capabilities: capabilities
			};
			// * 主机亲和特殊处理
			if (values.nodeAffinity) {
				if (values.nodeAffinityLabel) {
					sendData.nodeAffinity = values.nodeAffinityLabel.map(
						(item) => {
							return {
								label: item.label,
								required: values.nodeAffinityForce
									? values.nodeAffinityForce
									: false,
								namespace: globalNamespace.name
							};
						}
					);
				} else {
					Message.show(
						messageConfig('error', '失败', '请选择主机亲和。')
					);
				}
			}
			// * 删除动态表单中多余的主机亲和相关的值
			const dynamicValues = {};
			for (const index in values) {
				if (
					index !== 'nodeAffinityLabel' &&
					index !== 'nodeAffinityForce' &&
					index !== 'nodeAffinity' &&
					index !== 'name' &&
					index !== 'aliasName' &&
					index !== 'annotations' &&
					index !== 'tolerations' &&
					index !== 'tolerationsLabels'
				) {
					if (index === 'image.repository') {
						dynamicValues['mirrorImageId'] = mirrorList.find(
							(item) => item.address === values[index]
						)
							? mirrorList
									.find(
										(item) => item.address === values[index]
									)
									.id.toString()
							: '';
					}
					dynamicValues[index] = values[index];
				}
			}
			sendData.dynamicValues = dynamicValues;
			// * 主机容忍特殊处理
			if (values.tolerations) {
				if (values.tolerationsLabels) {
					sendData.tolerations = values.tolerationsLabels.map(
						(item) => {
							return item.label;
						}
					);
				} else {
					Message.show(
						messageConfig('error', '失败', '请选择主机容忍。')
					);
					return;
				}
			}
			setCommitFlag(true);
			postMiddleware(sendData).then((res) => {
				if (res.success) {
					setCreateData(res.data);
					setSuccessFlag(true);
					setErrorFlag(false);
					setCommitFlag(false);
				} else {
					setSuccessFlag(false);
					setErrorFlag(true);
					setCommitFlag(false);
				}
			});
		});
	};
	// * 结果页相关
	if (commitFlag) {
		return (
			<div style={{ height: '100%', textAlign: 'center', marginTop: 46 }}>
				<LoadingPage
					title="发布中"
					btnHandle={() => {
						history.push({
							pathname: `/serviceList/${chartName}/${aliasName}`
						});
					}}
					btnText="返回列表"
				/>
			</div>
		);
	}
	if (successFlag) {
		return (
			<div style={{ height: '100%', textAlign: 'center', marginTop: 46 }}>
				<SuccessPage
					title="发布成功"
					leftText="返回列表"
					rightText="查看详情"
					leftHandle={() => {
						history.push({
							pathname: `/serviceList/${chartName}/${aliasName}`
						});
					}}
					rightHandle={() => {
						history.push({
							pathname: `/serviceList/${chartName}/${aliasName}/basicInfo/${createData}/${chartName}/${chartVersion}`
						});
					}}
				/>
			</div>
		);
	}

	if (errorFlag) {
		return (
			<div style={{ height: '100%', textAlign: 'center', marginTop: 46 }}>
				<ErrorPage
					title="发布失败"
					btnHandle={() => {
						history.push({
							pathname: `/serviceList/${chartName}/${aliasName}`
						});
					}}
					btnText="返回列表"
				/>
			</div>
		);
	}
	return (
		<Page>
			<Page.Header
				title={`发布${chartName}服务`}
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Page.Content>
				<Form {...formItemLayout} field={field}>
					<FormBlock title="基本信息">
						<div className="w-50">
							<ul className="form-layout">
								<li className="display-flex flex-column">
									<label
										className="dynamic-form-name"
										style={{ paddingLeft: 8 }}
									>
										<span className="ne-required">
											服务名称
										</span>
									</label>
									<div className="form-content">
										<FormItem
											required
											requiredMessage="请输入服务名称"
											pattern={pattern.name}
											patternMessage="请输入由小写字母数字及“-”组成的2-24个字符"
										>
											<Input
												style={{ width: '390px' }}
												name="name"
												placeholder="请输入由小写字母数字及“-”组成的2-24个字符"
												trim
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex flex-column">
									<label className="dynamic-form-name">
										<span>显示名称</span>
									</label>
									<div className="form-content">
										<FormItem
											minLength={2}
											maxLength={80}
											minmaxLengthMessage="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
											pattern={pattern.nickname}
											patternMessage="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
										>
											<Input
												style={{ width: '390px' }}
												name="aliasName"
												placeholder="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex  flex-column">
									<label className="dynamic-form-name">
										<span>标签</span>
									</label>
									<div className="form-content">
										<FormItem
											pattern={pattern.labels}
											patternMessage="请输入key=value格式的标签，多个标签以英文逗号分隔"
										>
											<Input
												style={{ width: '390px' }}
												name="labels"
												placeholder="请输入key=value格式的标签，多个标签以英文逗号分隔"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex  flex-column">
									<label className="dynamic-form-name">
										<span>备注</span>
									</label>
									<div className="form-content">
										<FormItem>
											<Input.TextArea
												style={{ width: '390px' }}
												name="description"
												placeholder="请输入备注信息"
											/>
										</FormItem>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					{childrenRender(dataSource)}
					<div className="dynamic-summit-box">
						<Form.Submit
							type="primary"
							validate
							style={{ marginRight: 8 }}
							onClick={handleSubmit}
						>
							提交
						</Form.Submit>
						<Button
							type="normal"
							onClick={() => window.history.back()}
						>
							取消
						</Button>
					</div>
				</Form>
			</Page.Content>
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(DynamicForm);
