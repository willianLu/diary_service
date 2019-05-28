import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';

@Entity()
export class Book extends BaseEntity {
    @Column()
    coverUrl: string;

    @Column()
    bookName: string;

    @Column({ nullable: true })
    describe: string;
}