import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';

@Entity()
export class User extends BaseEntity {

    @Column({ nullable: true })
    userName: string;

    @Column({ default: 0 })
    age: number;

    @Column()
    nickName: string;

    @Column()
    avatarUrl: string;

    @Column()
    openId: string;

    @Column()
    phoneNumber: string;
}