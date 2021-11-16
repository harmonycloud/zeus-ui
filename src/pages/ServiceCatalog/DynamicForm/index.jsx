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
import FormBlock from '../components/FormBlock/index';
import { renderFormItem } from '@/components/renderFormItem';
import { getDynamicFormData } from '@/services/middleware';
import { postMiddleware } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';

// import FormNodeAffinity from '../../../components/FormNodeAffinity';
const { Item: FormItem } = Form;

const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};

function DynamicForm(props) {
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const {
		params: { chartName, chartVersion, version, aliasName }
	} = props.match;
	const [dataSource, setDataSource] = useState();
	const [capabilities, setCapabilities] = useState();
	const history = useHistory();
	const field = Field.useField();
	useEffect(() => {
		if (JSON.stringify(props.globalVar.cluster) !== '{}') {
			const sendData = {
				clusterId: globalCluster.id,
				chartName: chartName,
				chartVersion: chartVersion
			};
			getDynamicFormData(sendData).then((res) => {
				if (res.success) {
					const formatData = processData(res.data.questions);
					console.log(formatData);
					setDataSource(formatData);
					setCapabilities(res.data.capabilities);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
	}, [props]);

	const processData = (array) => {
		const obj = {};
		array.forEach((item) => {
			obj[item.group] = [];
		});
		array.forEach((item) => {
			if (Object.keys(obj).includes(item.group)) {
				obj[item.group].push(item);
			}
		});
		return obj;
	};

	const childrenRender = (values) => {
		if (values) {
			const keys = Object.keys(values);
			return (
				<div>
					{keys.map((item) => {
						return (
							<FormBlock key={item} title={item}>
								<div className="w-50">
									<ul className="form-layout">
										{values[item].map((formItem) => {
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
		field.validate((err, values) => {
			if (err) return;
			// console.log(values);
			const sendData = {
				clusterId: globalCluster.id,
				namespace: globalNamespace.name,
				type: chartName,
				chartName: chartName,
				chartVersion: chartVersion,
				version: version,
				name: values.name,
				aliasName: values.aliasName,
				annotation: values.annotation,
				labels: values.labels,
				capabilities: capabilities
			};
			// * 主机亲和特殊处理
			if (values.nodeAffinity) {
				if (values.nodeAffinityLabel) {
					sendData.nodeAffinity = values.affinityLabels.map(item => {
						return {
							label: item.label,
							required: values.nodeAffinityForce
								? values.nodeAffinityForce
								: false,
							namespace: globalNamespace.name
						}
					})
				} else {
					Message.show(
						messageConfig('error', '失败', '请选择主机亲和。')
					);
				}
			}
			// * 删除动态表单中多余的主机亲和相关的值
			const dynamicValues = {};
			for (let index in values) {
				if (
					index !== 'nodeAffinityLabel' &&
					index !== 'nodeAffinityForce' &&
					index !== 'nodeAffinity' &&
					index !== 'name' &&
					index !== 'aliasName' &&
					index !== 'annotation' &&
					index !== 'labels'
				) {
					dynamicValues[index] = values[index];
				}
			}
			sendData.dynamicValues = dynamicValues;
			// * 主机容忍特殊处理
			if (values.tolerations) {
				if (values.tolerationsLabels) {
					sendData.tolerations = values.tolerationsLabels.map(item => {
						return { label: item.label }
					})
				} else {
					Message.show(
						messageConfig('error', '失败', '请选择主机容忍。')
					);
				}
			}
			// console.log(sendData);
			postMiddleware(sendData).then((res) => {
				console.log(res);
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '中间件创建成功')
					);
					history.push({
						pathname: `/serviceList/${chartName}/${aliasName}`
					});
				} else {
					Message.show(messageConfig('error', '错误', res));
				}
			});
		});
	};

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
											patternMessage="请输入由小写字母数字及“-”组成的2-40个字符"
										>
											<Input
												style={{ width: '390px' }}
												name="name"
												placeholder="请输入由小写字母数字及“-”组成的2-40个字符"
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
										<span>描述</span>
									</label>
									<div className="form-content">
										<FormItem>
											<Input.TextArea
												style={{ width: '390px' }}
												name="annotation"
												placeholder="请输入描述信息"
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
export default connect(({ globalVar }) => ({ globalVar }), {})(DynamicForm);
