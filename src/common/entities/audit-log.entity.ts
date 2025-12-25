import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Role } from '../enums/enum.role';

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;  // UUID user thực hiện

    @Column()
    role: Role;  // role lúc đó

    @Column()
    actionToDb: string;  // 'CREATE_COMMENT', 'UPDATE_PRODUCT', 'DELETE_USER'...

    @Column()
    resourceId: string;  // id của resource bị thay đổi (commentId, productId...)

    // @Column({ type: 'json', nullable: true })
    // oldData?: any;  // snapshot trước khi thay đổi (optional)

    // @Column({ type: 'json', nullable: true })
    // newData?: any;  // snapshot sau thay đổi
    @Column({ type: 'jsonb', nullable: true })  // jsonb Postgres tốt hơn, SQLite dùng 'json'
    oldData?: Record<string, any>;  // type-safe hơn any

    @Column({ type: 'jsonb', nullable: true })
    newData?: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;
}