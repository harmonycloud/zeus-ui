import React, { Component, useEffect, useState } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page'
import AlarmRecord from './alarmRecord';
import Rules from './rules';
import AlarmSet from './alarmSet';
import './index.scss'

const { Menu } = Page;
function SystemAlarm() {
    const [selectedKey, setSelectedKey] = useState();

    const menuSelect = (selectedKeys) => {
        setSelectedKey(selectedKeys[0]);
    };

    const TabMenu = ({ selected, handleMenu }) => (
        <Menu
            id="mid-menu"
            selectedKeys={selected}
            onSelect={handleMenu}
            direction="hoz"
            className=""
        >
            <Menu.Item key="alarmRecord">系统告警记录</Menu.Item>
            <Menu.Item key="highAvailability">规则中心</Menu.Item>
            <Menu.Item key="externalAccess">告警设置</Menu.Item>
        </Menu>
    );

    const childrenRender = (key) => {
        switch (key) {
            case 'alarmRecord':
                // return <AlarmRecord />
                return <div>1111</div>
            case 'highAvailability':
                // return <Rules />
                return <div>222</div>
            case 'externalAccess':
                return <AlarmSet />
        }
    }

    useEffect(() => {
        setSelectedKey('alarmRecord');
    }, [])

    return (
        <Page className="system-alarm">
            <Header
                title="系统告警"
                subTitle="系统相关告警展示及设置"
            />
            <div className="tab-menu">
                <TabMenu selected={selectedKey} handleMenu={menuSelect} />
            </div>
            <Content>
                {childrenRender(selectedKey)}
            </Content>
        </Page>
    )
}

export default SystemAlarm