import { api } from '@/api.json';
// 平台总览数据
export const getPlatformOverview = `${api}/platform/overview`;
// 总览页告警记录
export const getEvent = `${api}/platform/overview/alertInfo`;
// 系统和服务告警记录
export const getEvents = `${api}/platform/overview/alerts`;
export const getServers = `${api}/platform/overview/middlewareInfo`;
