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
// * 查看数据库所有表
export const getDbTables = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables`;
// * 查看表所有列
export const getCols = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/columns`;
// * 查看表所有索引
// export const gerIndexs = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}`
// * 查询用户列表
export const getMysqlUsers = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/users`;
// * 合并 查询数据库列表
export const getAllDatabases = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/databases`;
// * 合并 获取用户列表
export const getUsers = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users`;
// * 合并 删除用户
export const deleteUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users/{username}`;
// * 合并 新增用户
export const createUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middleware}/user`;
