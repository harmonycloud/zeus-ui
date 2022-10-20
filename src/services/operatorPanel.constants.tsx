import { api } from '@/api.json';
// * 登录控制台
export const AuthLogin = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/auth`;
// * 查询数据库列表
export const getDatabases = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases`;
// * 查询字符集
export const getCharset = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/charsets`;
// * 查询校验规则
export const getCollation = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/charsets/{charset}/collations`;
// * 删除数据库
export const deleteDb = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}`;
// * 创建/编辑数据库
export const updateDb = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases`;
