import "reflect-metadata";
import { createConnection, getConnection, ObjectType } from "typeorm";
import { MysqlRepository } from './MysqlService';

const ormconfig = require('../../config/ormconfig.json');

/**
 * 读取配置，并链接数据库
 *
 * @export
 */
export async function ConnectionDatabase() {
    await createConnection(ormconfig);
}

/**
 * 关闭数据库连接
 *
 * @export
 * @returns
 */
export async function CloseConnection() {
    return await getConnection().close();
}

/**
 * 获取mysql数据连接服务
 *
 * @export
 * @template TEntity
 * @param {ObjectType<TEntity>} entityClass
 * @returns
 */
export function GetMysqlServiceAsync<TEntity>(entityClass: ObjectType<TEntity>) {
    let conn = getConnection();
    return new MysqlRepository(conn, entityClass);
}