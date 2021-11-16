import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Field, Grid } from '@alicloud/console-components';
import Ding from '@/assets/images/ding.svg';
import Email from '@/assets/images/email.svg';

const { Row, Col } = Grid;
const formItemLayout = {
    labelCol: {
        span: 5
    },
    wrapperCol: {
        span: 19
    }
};

function AlarmSet() {
    const field = Field.useField();
    const dingField = Field.useField();
    const [btnStatus, setBtnStatus] = useState(false);

    field.validate((value, error) => {
        console.log(error);
        if (error) return;
        setBtnStatus(true);
    })

    return (
        <div className="alarm-set">
            <div className="box">
                <div className="box-header">
                    <div className="header-img">
                        <img src={Email} />
                    </div>
                    <div className="header-info">
                        <div>
                            <span className="type">邮箱</span>
                            <span className="status">已设置</span>
                        </div>
                        <p>设置一个能正常收、发邮件到邮件服务器，告警信息第一时间通过邮件告知，及时、高效、规范。</p>
                    </div>
                </div>
                <div className="box-content">
                    <Row>
                        <Col span={13} offset={4}>
                            <Form
                                field={field}
                                {...formItemLayout}
                                style={{ padding: "24px" }}
                            >
                                <Form.Item required label="邮箱服务器">
                                    <Input placeholder="请输入邮箱服务器" />
                                </Form.Item>
                                <Form.Item required label="端口">
                                    <Input placeholder="请输入端口" />
                                </Form.Item>
                                <Form.Item required label="用户">
                                    <Input placeholder="请输入用户" />
                                </Form.Item>
                                <Form.Item required label="密码">
                                    <Input placeholder="请输入密码" />
                                </Form.Item>
                                <Form.Item required label="告警邮箱地址">
                                    <Input placeholder="所有的告警信息将由该地址发送到您的邮箱" />
                                </Form.Item>
                                <div className="btns">
                                    <Button>取消</Button>
                                    <Button>连接测试</Button>
                                    <Button className={btnStatus ? 'normal' : 'error'} disabled={btnStatus}>保存</Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </div>
            </div>
            <div className="box">
                <div className="box-header">
                    <div className="header-img">
                        <img src={Ding} />
                    </div>
                    <div className="header-info">
                        <div>
                            <span className="type">邮箱</span>
                            <span className="status none">已设置</span>
                        </div>
                        <p>设置一个或多个钉钉机器人，告警信息第一时间同步钉钉应用（最多添加10个Webhook）。</p>
                    </div>
                </div>
                <div className="box-content">
                    <Row>
                        <Col span={13} offset={4}>
                            <Form
                                field={field}
                                {...formItemLayout}
                                style={{ padding: "24px" }}
                            >
                                <Form.Item required label="Webhook地址1">
                                    <Input placeholder="请输入Webhook地址" />
                                </Form.Item>
                                <Form.Item label="加签密钥" labelCol={{span: 3,offset: 11}} wrapperCol={{span: 10}}>
                                    <Input placeholder="端口" />
                                </Form.Item>
                                <div className="btns">

                                    <Button>取消</Button>
                                    <Button>连接测试</Button>
                                    <Button className={btnStatus ? 'normal' : 'error'} disabled={btnStatus}>保存</Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}

export default AlarmSet