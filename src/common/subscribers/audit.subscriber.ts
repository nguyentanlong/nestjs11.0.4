// src/common/subscribers/audit.subscriber.ts
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';
import { AuditLogService } from '../services/audit-log.service';
import { Role } from '../enums/enum.role';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
    constructor(private auditLogService: AuditLogService) { }

    afterInsert(event: InsertEvent<any>) {
        this.auditLogService.log(
            // userId từ request (cần truyền qua connection hoặc custom decorator)
            // tạm để 'system' nếu không có
            'system',
            Role.ADMIN,
            `CREATE_${event.metadata.tableName.toUpperCase()}`,
            event.entity.id,
        );
    }

    // Tương tự afterUpdate, beforeRemove...
}