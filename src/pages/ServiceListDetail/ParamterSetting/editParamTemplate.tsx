import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
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

import {
	setParamTemplateBasic,
	setParamTemplateConfig,
	setParamTemplateBasicClear,
	setParamTemplateConfigClear
} from '@/redux/param/param';
import {
	initParamsTemp,
	createParamsTemp,
	getParamsTemp,
	editParamsTemp
} from '@/services/template';

import pattern from '@/utils/pattern';
import { formItemLayout614 } from '@/utils/const';
import { StoreState } from '@/types';
import { EditParamTemplateProps } from '../detail';
import messageConfig from '@/components/messageConfig';

interface ParamsProps {
	type: string;
	chartVersion: string;
	middlewareName: string;
	uid: string;
	templateName: string;
	name: string;
	aliasName: string;
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
		setParamTemplateBasic,
		setParamTemplateConfig,
		setParamTemplateBasicClear,
		setParamTemplateConfigClear
	} = props;
	console.log(param);
	const [current, setCurrent] = useState<number>(0);
	const field = Field.useField();
	useEffect(() => {
		field.setValues({ name: param.name, description: param.description });
	}, [props.param]);
	useEffect(() => {
		initParamsTemp({ chartVersion, type }).then((res) => {
			console.log(res);
			if (res.success) {
				setParamTemplateConfig(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		return () => {
			setParamTemplateBasicClear();
			setParamTemplateConfigClear();
		};
	}, []);
	const goNext = () => {
		if (current === 0) {
			field.validate((error) => {
				if (error) return;
				setParamTemplateBasic(field.getValues());
				setCurrent(current + 1);
			});
		}
		// if (current === 1) {}
	};
	const childrenRender = (value: number) => {
		switch (value) {
			case 0:
				return (
					<FormBlock title="基础信息">
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
								pattern={pattern.roleName}
								patternMessage="模板名称长度不可超过10字符"
								requiredMessage="请输入模板名称"
							>
								<Input
									name="name"
									placeholder="请输入模板名称"
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
				return <ParamEditTable />;
			default:
				break;
		}
	};
	return (
		<Page>
			<Header
				title="新建参数模版"
				hasBackArrow
				onBackArrowClick={() => window.history.back()}
			/>
			<Content>
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
				<div className="zeus-edit-param-summit-btn">
					{current === 1 && (
						<Button
							type="normal"
							onClick={() => setCurrent(current - 1)}
						>
							上一步
						</Button>
					)}
					<Button type="primary" onClick={goNext}>
						下一步
					</Button>
					<Button type="normal">取消</Button>
				</div>
			</Content>
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	param: state.param
});
export default connect(mapStateToProps, {
	setParamTemplateBasic,
	setParamTemplateConfig,
	setParamTemplateBasicClear,
	setParamTemplateConfigClear
})(EditParamTemplate);
