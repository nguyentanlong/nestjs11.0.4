import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { ProductsModule } from '../products/products.module';  // import để dùng ProductService
import { AuditLogService } from 'src/common/services/audit-log.service';

@Module({
    imports: [TypeOrmModule.forFeature([Comment]), ProductsModule],
    controllers: [CommentsController],
    providers: [CommentsService, AuditLogService],
    exports: [CommentsService],  // nếu module khác cần
})
export class CommentsModule { }