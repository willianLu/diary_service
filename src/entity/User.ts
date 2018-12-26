import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';

@Entity()
export class User extends BaseEntity {

    @Column()
    userName: string;

    @Column({ default: 0 })
    age: number;
}