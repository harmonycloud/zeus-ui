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
// * pgsql 获取模式列表 / 创建模式
export const getSchemas = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas`;
// * pgsql 删除模式 / 编辑模式 / 获取模式详情
export const updateSchemas = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}`;
// * pgsql 获取table列表 / 创建table列表
export const getPgTables = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables`;
// * pgsql 删除table列表
export const deletePgTable = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}`;
// * pgsql 获取cols
export const getPgCols = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}/schemas/{schemaName}/tables/{tableName}/columns`;
// * pgsql 获取字符集
export const getEncoding = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/encoding`;
// * pgsql 新建数据库
export const createPgDatabase = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases`;
// * pgsql 修改数据库
export const updatePgDatabase = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/databases/{databaseName}`;
// * mysql 重置密码
export const resetMysqlPassword = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/users/{username}/password`;
// * pgsql 重置密码
export const resetPgsqlPassword = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/users/{username}/reset`;
// * pgsql 启用/禁用用户
export const enablePgsqlUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/users/{username}/enable`;
// * mysql 启用/禁用用户
export const enalbeMysqlUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/users/{username}/{lock}`;
// * mysql 授权数据库
export const mysqlAuthDatabase = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/privilege`;
// * mysql 授权数据表
export const mysqlAuthTable = `${api}/clusters/{clusterId}/namespaces/{namespace}/mysql/{middlewareName}/databases/{database}/tables/{table}/privilege`;
// * pgsql 授权
export const pgsqlAuth = `${api}/clusters/{clusterId}/namespaces/{namespace}/postgresql/{middlewareName}/users/{username}/authority`;

// *--------------------------------------------------
// * mysql & pgsql 合并接口 可能与上面接口存在重复
// * 合并 查询数据库列表
export const getAllDatabases = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/databases`;
// * 合并 删除数据库列表
export const deleteAllDatabases = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/databases/{databaseName}`;
// * 合并 获取用户列表
export const getUsers = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users`;
// * 合并 删除用户
export const deleteUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users/{username}`;
// * 合并 新增用户
export const createUser = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users`;
// * 合并 获取用户权限详情
export const getUserAuth = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users/{username}/authority`;
// * 合并 取消授权
export const cancelAuth = `${api}/clusters/{clusterId}/namespaces/{namespace}/{type}/{middlewareName}/users/{username}/authority`;
