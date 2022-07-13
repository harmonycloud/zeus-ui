import { api } from '@/api.json';

// * 设置邮箱
export const setMail = `${api}/mail`;
// * 获取邮箱信息
export const getMail = `${api}/mail/getMailInfo`;
// * 选择被通知人
export const insertUser = `${api}/mail/insertUser`;
// * 发送邮箱
export const sendMail = `${api}/mail/sendMail`;
// * 邮箱连接测试
export const connectMail = `${api}/mail/connect`;
// * 设置、获取钉钉机器人
export const ding = `${api}/ding`;
// * 钉钉告警
export const sendDing = `${api}/ding/sendDing`;
// * 钉钉连接测试
export const connectDing = `${api}/ding/connect`;
// * 服务告警联系人设置
export const alertSetting = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/rules/alertSetting`;
// * 系统告警联系人设置
export const systemAlertSetting = `${api}/rules/systemAlertSetting`;
