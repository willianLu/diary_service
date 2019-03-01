import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';

@Entity()
export class User extends BaseEntity {

    @Column({ nullable: true })
    userName: string;

    @Column({ nullable: true })
    sex: string;

    @Column({ default: 0 })
    age: number;

    @Column({ nullable: true })
    nickName: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column()
    openId: string;
}