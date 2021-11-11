import React, { useEffect, useState, useMemo, useRef, createRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Page, Content, Header } from '@alicloud/console-components-page';
import {
    Button,
    Form,
    Upload,
    Icon,
    Input,
    Radio,
    Field,
    Message
} from '@alicloud/console-components';
import Confirm from '@alicloud/console-components-confirm';
import { personalizationProps } from './personalization';
import background from '../../assets/images/login_bg.svg'
import homeLogo from '@/assets/images/logo.svg';
import logo from '@/assets/images/navbar/zeus-logo-small.svg';
import messageConfig from '@/components/messageConfig';
import storage from '@/utils/storage';
import { api } from '@/api.json';
import { getPersonalConfig, personalized } from '@/services/user';
import './index.scss';

const formItemLayout = {
    labelCol: {
        fixedSpan: 6
    },
    wrapperCol: {
        span: 10
    }
};

function Personlization(): JSX.Element {
    const history = useHistory();
    const field: Field = Field.useField();
    const headers = {
        userToken: storage.getLocal('token'),
        authType: storage.getLocal('token') ? 1 : 0
    };
    const [data, setData] = useState<personalizationProps>();
    const personalization = storage.getLocal('personalization');
    const [status, setStatus] = useState<number | string | boolean>('0');

    useEffect(() => {
        getData();
    }, [])

    const getData = () => {
        getPersonalConfig({}).then((res) => {
            if (!res.data) return;
            setData(res.data);
            setStatus(res.data.status);
            storage.setLocal('personalization',res.data);
            field.setValues(res.data);
            document.title = res.data && res.data.title ? res.data.title : 'Zeus'; 
        })
    }

    const beforeUpload = (info: any) => {
        // console.log(info);

        if (info.size / 1024 / 1024 > 2) {
            Message.show(
                messageConfig(
                    'warning',
                    '图片过大，请重新上传',
                )
            );
            return false;
        }
        if (info.type !== 'image/svg+xml' && info.type !== 'image/jpeg' && info.type !== 'image/png') {
            Message.show(
                messageConfig(
                    'warning',
                    '文件格式错误，请重新上传',
                )
            );
            return false;
        }
    }

    const logoBeforeUpload = (info: any) => {
        // console.log(info);

        if (info.size / 1024 / 1024 > 2) {
            Message.show(
                messageConfig(
                    'warning',
                    '图片过大，请重新上传',
                )
            );
            return false;
        }
        if (info.type !== 'image/svg+xml') {
            Message.show(
                messageConfig(
                    'warning',
                    '文件格式错误，请重新上传',
                )
            );
            return false;
        }
    }

    const onSuccess = (info: any) => {
        // console.log('onSuccess : ', info);
        if (info) {
            Message.show(
                messageConfig(
                    'success',
                    '成功',
                    '图片上传成功'
                )
            );
        }
    }

    const onSubmit = () => {
        field.validate((errors, values: any) => {
            if (errors) return;
            delete values.backgroundPath;
            delete values.loginLogoPath;
            delete values.homeLogoPath;
            delete values.backgroundImage;
            delete values.loginLogo;
            delete values.homeLogo;
            console.log();
            
            if (values.status === "1") {
                values.status = 'init'
            } else {
                values.status = ''
            }
            personalized(values).then(res => {
                if (res.code) return;
                getData();
            })
        });

    };

    return (
        <Page className="personlization">
            <Header
                hasBackArrow
                renderBackArrow={(elem) => (
                    <span
                        className="details-go-back"
                        onClick={() => window.history.back()}
                    >
                        {elem}
                    </span>
                )}
                title="个性化"
                subTitle="自定义登陆页背景、logo、平台名称等"
            />
            <Content>
                <Form field={field} {...formItemLayout}>
                    <h2>登陆页配置</h2>
                    <Form.Item label="背景" required labelTextAlign="left">
                        <Upload
                            style={{ display: 'inline' }}
                            listType="card"
                            action={`${api}/user/uploadFile?type=background`}
                            accept="image/svg,image/jpg,image/png,.svg"
                            limit={1}
                            useDataURL={true}
                            headers={headers}
                            beforeUpload={beforeUpload}
                            onSuccess={onSuccess}
                            defaultValue={[
                                {
                                    name: 'IMG.png',
                                    state: 'done',
                                    size: 1024,
                                    downloadURL: personalization.backgroundPath ? api+'/images/middleware/'+personalization.backgroundPath : background,
                                    fileURL: personalization.backgroundPath ? api+'/images/middleware/'+personalization.backgroundPath : background,
                                    imgURL: personalization.backgroundPath ? api+'/images/middleware/'+personalization.backgroundPath : background
                                }
                            ]}
                        >
                            <div className="next-upload-card">
                                <Icon type="upload" size="large" />
                                <div className="next-upload-text">上传</div>
                            </div>
                        </Upload>
                        <p className="upload-info">
                            图片支持2M以下的jpg、svg、png格式
                        </p>
                    </Form.Item>
                    <Form.Item
                        label="登陆页logo"
                        required
                        labelTextAlign="left"
                    >
                        <Upload
                            style={{ display: 'inline' }}
                            listType="image"
                            action={`${api}/user/uploadFile?type=login`}
                            accept="image/svg,.svg"
                            limit={1}
                            useDataURL={true}
                            headers={headers}
                            beforeUpload={logoBeforeUpload}
                            defaultValue={[
                                {
                                    name: 'IMG.png',
                                    state: 'done',
                                    size: 1024,
                                    url: personalization.homeLogoPath ? api+'/images/middleware/'+personalization.homeLogoPath : homeLogo
                                }
                            ]}
                        >
                            <Button>
                                <Icon type="upload" />
                                上传
                            </Button>
                        </Upload>
                        <p className="upload-info">图片支持2M以下的svg格式</p>
                    </Form.Item>
                    <Form.Item
                        label="平台名称"
                        labelTextAlign="left"
                        maxLength={30}
                        minmaxLengthMessage="长度不能超过30个字符"
                    >
                        <Input
                            name="platformName"
                            placeholder="我是平台名称，支持空格，限定在30字符内"
                        />
                    </Form.Item>
                    <Form.Item
                        label="Slogan"
                        labelTextAlign="left"
                        maxLength={50}
                        minmaxLengthMessage="长度不能超过50个字符"
                    >
                        <Input.TextArea name="slogan" placeholder="产品说明，字数限定在50字符" />
                    </Form.Item>
                    <Form.Item
                        label="版本声明"
                        labelTextAlign="left"
                        maxLength={30}
                        minmaxLengthMessage="长度不能超过30个字符"
                    >
                        <Input name="copyrightNotice" placeholder="我是版权声明，支持空格，限定在30字符内" />
                    </Form.Item>
                    <h2>登陆后系统页配置</h2>
                    <Form.Item
                        label="左上角logo"
                        required
                        labelTextAlign="left"
                    >
                        <Upload
                            style={{ display: 'inline' }}
                            listType="card"
                            action={`${api}/user/uploadFile?type=home`}
                            accept="image/svg,.svg"
                            headers={headers}
                            useDataURL={true}
                            limit={1}
                            beforeUpload={logoBeforeUpload}
                            defaultValue={[
                                {
                                    name: 'IMG.png',
                                    state: 'done',
                                    size: 1024,
                                    downloadURL: personalization.loginLogoPath ? api+'/images/middleware/'+personalization.loginLogoPath : logo,
                                    fileURL: personalization.loginLogoPath ? api+'/images/middleware/'+personalization.loginLogoPath : logo,
                                    imgURL: personalization.loginLogoPath ? api+'/images/middleware/'+personalization.loginLogoPath : logo
                                }
                            ]}
                        >
                            <div className="next-upload-card">
                                <Icon type="upload" size="large" />
                                <div className="next-upload-text">上传</div>
                            </div>
                        </Upload>
                        <p className="upload-info">图片支持2M以下的svg格式</p>
                    </Form.Item>
                    <Form.Item
                        label="浏览器tab标题"
                        required
                        requiredMessage="请输入浏览器标题"
                        labelTextAlign="left"
                        maxLength={20}
                        minmaxLengthMessage="长度不能超过20个字符"
                    >
                        <Input
                            name="title"
                            placeholder="我是浏览器标题，字数限制在20字符"
                        />
                    </Form.Item>
                    <h2>恢复出厂设置</h2>
                    <Form.Item label="是否恢复初始化" labelTextAlign="left">
                        <Radio.Group name="status" onChange={(value) => setStatus(value)}>
                            <Radio id="no" value="0">
                                否
                            </Radio>
                            <Radio id="yes" value="1">
                                是
                            </Radio>
                        </Radio.Group>
                    </Form.Item>
                </Form>
                <div className="detail-divider" />
                <div>
                    {
                        Number(status) ?
                            <Confirm
                                type="notice"
                                title="确认恢复"
                                content="确认恢复出厂设置？"
                                onConfirm={onSubmit}
                            >
                                <Button type="primary">
                                    提交
                                </Button>
                            </Confirm> :
                            <Button type="primary" onClick={onSubmit}>
                                提交
                            </Button>
                    }
                    <Button
                        style={{ marginLeft: '5px' }}
                        onClick={() => field.reset()}
                    >
                        取消
                    </Button>
                </div>
            </Content>
        </Page>
    );
}

export default Personlization;
