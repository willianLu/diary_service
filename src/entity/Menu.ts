import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base/BaseEntity';

@Entity()
export class Menu extends BaseEntity {

    @Column()
    name: string;

    @Column()
    path: string;

    @Column({ default: 1 })
    level: number;

    @Column()
    parentId: string;

    @Column()
    userId: string;
    
}