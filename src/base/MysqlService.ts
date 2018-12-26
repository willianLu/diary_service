import { Connection, ObjectLiteral, ObjectType, Repository, FindManyOptions, FindOneOptions, FindConditions, SaveOptions } from 'typeorm';

/**
 * mysql查询方法类
 *
 * @export
 * @class MysqlRepository
 * @template TEntity
 */
export class MysqlRepository<TEntity extends ObjectLiteral> {

    public repo: Repository<TEntity>;
    public connection: Connection;
    constructor(connection: Connection, entityClass: ObjectType<TEntity>) {
        this.connection = connection;
        this.repo = connection.getRepository(entityClass);
    }

    /**
     * 按条件搜索数据库
     *
     * @param {FindManyOptions<TEntity>} [options]
     * @returns
     * @memberof MysqlRepository
     */
    findAsync(options?: FindManyOptions<TEntity>) {
        return this.repo.find(options);
    }

    /**
     * 按照id或条件搜索单条数据
     *
     * @param {string} [id]
     * @param {FindOneOptions<TEntity>} [options]
     * @returns
     * @memberof MysqlRepository
     */
    findOneAsync(id?: string, options?: FindOneOptions<TEntity>) {
        return this.repo.findOne(id, options);
    }

    /**
     * 按照id或条件搜索单条数据，如果未查到将抛出错误
     *
     * @param {string} [id]
     * @param {FindOneOptions<TEntity>} [options]
     * @returns
     * @memberof MysqlRepository
     */
    findOneOrFailAsync(id?: string, options?: FindOneOptions<TEntity>) {
        return this.repo.findOneOrFail(id, options);
    }

    /**
     * 按照id数组及条件搜索数据
     *
     * @param {string[]} ids
     * @param {FindManyOptions<TEntity>} [options]
     * @returns
     * @memberof MysqlRepository
     */
    findByIdsAsync(ids: string[], options?: FindManyOptions<TEntity>) {
        return this.repo.findByIds(ids, options);
    }

    /**
     * 按条件搜索数据，并计算总条数（多用于分页）
     *
     * @param {FindManyOptions<TEntity>} [options]
     * @returns
     * @memberof MysqlRepository
     */
    findCountAsync(options?: FindManyOptions<TEntity>) {
        return this.repo.findAndCount(options);
    }

    /**
     * 获取符合条件的数据库条数
     *
     * @param {FindManyOptions<TEntity>} [options]
     * @returns
     * @memberof MysqlRepository
     */
    countAsync(options?: FindManyOptions<TEntity>) {
        return this.repo.count(options);
    }

    /**
     * 保存单个实体数据
     *
     * @param {TEntity} entityClass
     * @returns
     * @memberof MysqlRepository
     */
    saveAsync(entityClass: TEntity) {
        return this.repo.save(entityClass);
    }

    /**
     * 保存多个同一实体数据
     *
     * @param {TEntity[]} entityClass
     * @returns
     * @memberof MysqlRepository
     */
    saveMultiAsync(entityClass: TEntity[], options?: SaveOptions) {
        return this.repo.save(entityClass, options);
    }

    /**
     * 按id或条件更新数据
     *
     * @param {(string | Partial<TEntity>)} id
     * @param {Partial<TEntity>} entityClass
     * @returns
     * @memberof MysqlRepository
     */
    updateAsync(id: string | Partial<TEntity>, entityClass: Partial<TEntity>) {
        return this.repo.update(id, entityClass);
    };

    /**
     * 按id或条件将数据更新为逻辑删除（isDelet=true）
     *
     * @param {(string | Partial<TEntity>)} id
     * @returns
     * @memberof MysqlRepository
     */
    isDelectAsync(id: string | Partial<TEntity>) {
        let options: any = {
            isDelete: true
        };
        return this.repo.update(id, options);
    }

    /**
     * 按id、id数组或条件删除数据库数据
     *
     * @param {(string | string[] | Partial<TEntity>)} options
     * @returns
     * @memberof MysqlRepository
     */
    deleteAsync(options: string | string[] | Partial<TEntity>) {
        return this.repo.delete(options);
    }

    /**
     * 按条件，对实体某个key值执行增量操作
     *
     * @param {FindConditions<TEntity>} conditions
     * @param {string} key
     * @param {number} value
     * @returns
     * @memberof MysqlRepository
     */
    incrementAsync(conditions: FindConditions<TEntity>, key: string, value: number) {
        return this.repo.increment(conditions, key, value);
    }

    /**
     * 按条件，对实体某个key值执行减量操作
     *
     * @param {FindConditions<TEntity>} conditions
     * @param {string} key
     * @param {number} value
     * @returns
     * @memberof MysqlRepository
     */
    decrementAsync(conditions: FindConditions<TEntity>, key: string, value: number) {
        return this.repo.decrement(conditions, key, value);
    }

    /**
     * 执行原生sql语句查询，备注：特殊需求时使用
     *
     * @param {string} sql
     * @param {any[]} [parameters]
     * @returns
     * @memberof MysqlRepository
     */
    queryAsync(sql: string, parameters?: any[]) {
        return this.repo.query(sql, parameters);
    }

    /**
     * 删除实体表所有数据，不建议使用
     *
     * @returns
     * @memberof MysqlRepository
     */
    // clearAsync() {
    //     return this.repo.clear();
    // }

    
    /**
     * 执行事务操作，传入回调函数，得到回调参数entityManager: EntityManager
     *
     * @param {*} callback
     * @returns
     * @memberof MysqlRepository
     */
    transactionAsync(callback: any) {
        return this.connection.transaction(callback);
    }
}