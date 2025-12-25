/*import { DataSource } from 'typeorm';
import { AuditLog } from './common/entities/audit-log.entity';

export const AuditDataSource = new DataSource({
    type: 'postgres',  // hoặc mysql
    host: process.env.AUDIT_DB_HOST,
    port: +process.env.AUDIT_DB_PORT,
    username: process.env.AUDIT_DB_USERNAME,
    password: process.env.AUDIT_DB_PASSWORD,
    database: process.env.AUDIT_DB_DATABASE,
    entities: [AuditLog],
    synchronize: false,  // prod dùng migration
    logging: false,
});*/
import { DataSource } from 'typeorm';
import { AuditLog } from './common/entities/audit-log.entity';

export const AuditDataSource = new DataSource({
    type: 'better-sqlite3',
    database: 'audit.db',  // file DB riêng cho audit log
    entities: [AuditLog],
    synchronize: true,  // dev thì true, prod thì migration
    logging: false,
});