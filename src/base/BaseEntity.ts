import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import uuid from 'uuid';
/**
 * 数据实体基础类
 *
 * @export
 * @class BaseEntity
 */
@Entity()
export class BaseEntity {
    constructor() {
        this.id = uuid.v1().replace(/-/g, '');
    }
    /**
     * 数据库id主键
     *
     * @type {string}
     * @memberof BaseEntity
     */
    @PrimaryColumn()
    id: string;
    /**
     * 数据创建时间
     *
     * @type {Date}
     * @memberof BaseEntity
     */
    @CreateDateColumn()
    createdTime: Date;
    /**
     * 数据更新时间
     *
     * @type {Date}
     * @memberof BaseEntity
     */
    @UpdateDateColumn()
    lastModifyTime: Date;
    /**
     * 是否逻辑删除
     *
     * @type {Boolean}
     * @memberof BaseEntity
     */
    @Column({ default: false })
    isDelete: Boolean;
}