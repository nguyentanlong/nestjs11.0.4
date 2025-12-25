import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditDataSource } from 'src/data-source-audit';
import { Role } from '../enums/enum.role';
// import { Role } from '../enums/enum.role';
/*
@Injectable()
export class AuditLogService {
    private auditRepo: Repository<AuditLog>;

    constructor() {
        this.auditRepo = AuditDataSource.getRepository(AuditLog);
    }

    async log(...) {
        if (!AuditDataSource.isInitialized) {
            await AuditDataSource.initialize();
        }
        const log = this.auditRepo.create({ ... });
        await this.auditRepo.save(log);
    }
}*/
/*@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    ) { }

    async log(
        userId: string,
        role: Role,
        action: string,
        resourceId: string,
        oldData?: any,
        newData?: any,
    ) {
        const log = this.auditRepo.create({
            userId,
            role,
            action,
            resourceId,
            oldData,
            newData,
        });
        await this.auditRepo.save(log);
    }
}*/
@Injectable()
export class AuditLogService {
    private auditRepo: Repository<AuditLog>;

    constructor() {
        this.auditRepo = AuditDataSource.getRepository(AuditLog);
    }

    async log(userId: string, role: Role, resourceId: string, actionToDb: string, oldData?: any, newData?: any/*, beforeInsert?:any, afterInsert?:any*/) {
        try {
            if (!AuditDataSource.isInitialized) {
                await AuditDataSource.initialize();
            }

            const log = this.auditRepo.create({
                actionToDb,
                userId,
                role,
                resourceId,
                //   afterInsert,
                oldData,
                newData,
                createdAt: new Date(),
            });

            await this.auditRepo.save(log);
        } catch (error) {
            console.error('Audit log lỗi:', error);  // silent fail, không crash app
        }
    }
}
