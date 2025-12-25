/*import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Role } from '../../common/enums/enum.role';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        private productService: ProductsService,
    ) { }

    async create(productId: string, dto: CreateCommentDto, userId: string, role: Role, parentId?: string) {
        const product = await this.productService.findOne(productId);  // check product exist

        // const comment = this.commentRepo.save({
        //     content: dto.content,
        //     tags: dto.tags,  // tag usernames
        //     userId,//: { id: userId },
        //     productId,//: { id: productId },
        //     parent: parentId || null,//? { id: parentId } : null,
        // });
        // return this.commentRepo.save(comment);
        const commentData = {
            content: dto.content,
            tags: dto.tags,
            userId,
            productId,
            parentId: parentId ?? null,  // ?? null để null nếu undefined
            // BỎ parent object hoàn toàn, chỉ dùng parentId column
        } as DeepPartial<Comment>;  // cast DeepPartial để TS chấp nhận

        return this.commentRepo.save(commentData);
    }

    async like(commentId: string, userId: string) {  // simple like (increase count)
        await this.commentRepo.increment({ id: commentId }, 'likes', 1);
        return { message: 'Liked' };
    }

    async unlike(commentId: string, userId: string) {  // decrease count
        await this.commentRepo.decrement({ id: commentId }, 'likes', 1);
        return { message: 'Unliked' };
    }

    async update(commentId: string, dto: UpdateCommentDto, userId: string, role: Role) {
        const comment = await this.commentRepo.findOneBy({ id: commentId });
        if (!comment) throw new NotFoundException('Không tìm thấy Comment để update');

        if (role !== Role.ADMIN && comment.user.id !== userId) {
            throw new ForbiddenException('Chỉ được update comment chính mình');
        }

        Object.assign(comment, dto);
        return this.commentRepo.save(comment);
    }

    async delete(commentId: string, userId: string, role: Role) {
        const comment = await this.commentRepo.findOneBy({ id: commentId });
        if (!comment) throw new NotFoundException('Không tìm thấy Comment để xóa');

        if (role !== Role.ADMIN && comment.user.id !== userId) {
            throw new ForbiddenException('Chỉ được delete comment chính mình');
        }

        await this.commentRepo.softDelete(commentId);  // soft delete
        return { message: 'Deleted' };
    }

    // Share: có thể là copy link comment, không cần code backend phức tạp
    // Tag: lưu trong content/tags, gửi notification sau nếu cần
}*/
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Role } from '../../common/enums/enum.role';
import { ProductsService } from '../products/products.service';
import { AuditLogService } from '../../common/services/audit-log.service'


@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment) private commentRepo: Repository<Comment>,
        private productService: ProductsService, private auditLogService: AuditLogService,
    ) { }

    async create(productId: string, dto: CreateCommentDto, userId: string, role: Role, parentId?: string) {
        const product = await this.productService.findOne(productId);  // check product exist

        const commentData = {
            content: dto.content,
            tags: dto.tags,
            userId,
            productId,
            parentId: parentId ?? null,  // null nếu top-level
        } as DeepPartial<Comment>;

        return this.commentRepo.save(commentData);
    }

    /*async like(commentId: string, userId: string) {
        await this.commentRepo.increment({ id: commentId }, 'likes', 1);
        return { message: 'Liked' };
    }

    async unlike(commentId: string, userId: string) {
        await this.commentRepo.decrement({ id: commentId }, 'likes', 1);
        return { message: 'Unliked' };
    }*/


    async toggleLike(commentId: string, userId: string) {
        const comment = await this.commentRepo.findOneBy({ id: commentId });
        if (!comment) throw new NotFoundException('Comment không tồn tại');

        // Khởi tạo mảng nếu null
        if (!comment.likedUsers) comment.likedUsers = [];

        const hasLiked = comment.likedUsers.includes(userId);

        if (hasLiked) {
            // Đã like → unlike (trừ 1)
            comment.likedUsers = comment.likedUsers.filter(id => id !== userId);
            comment.likes -= 1;
        } else {
            // Chưa like → like (cộng 1)
            comment.likedUsers.push(userId);
            comment.likes += 1;
        }

        await this.commentRepo.save(comment);

        return {
            message: hasLiked ? 'Unlike thành công' : 'Like thành công',
            likes: comment.likes,
            hasLiked: !hasLiked,  // trả trạng thái mới để frontend đổi nút
        };
    }
    // UPDATE COMMENT – thêm load user để check ownership chính xác
    async update(commentId: string, dto: UpdateCommentDto, userId: string, role: Role) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['user'],  // load user để check userId
        });
        if (!comment) throw new NotFoundException('Không tìm thấy Comment để sữa nha ku');

        // ADMIN full quyền update mọi comment
        // STAFF/USER chỉ update comment của chính mình (check userId)
        if (role !== Role.ADMIN && comment.userId !== userId) {
            throw new ForbiddenException('Chỉ được update comment của chính mình thôi nhé ku');
        }

        comment.content = dto.content ?? comment.content;
        comment.tags = dto.tags ?? comment.tags;
        // comment.likes = dto.likes ??
        // LOG AUDIT
        await this.auditLogService.log(
            userId, role, commentId, // resourceId 
            'UPDATE_COMMENT', // actionToDb 
            oldData,
            newData,
        );

        return this.commentRepo.save(comment);
        //cái này sẽ ghi đè tất cả!
        // Object.assign(comment, dto);
        // return this.commentRepo.save(comment);
    }

    // DELETE COMMENT – thêm load user để check ownership chính xác
    async delete(commentId: string, userId: string, role: Role) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['user'],  // load user để check userId
        });
        if (!comment) throw new NotFoundException('Không tìm thấy Comment để xóa');

        // ADMIN full quyền delete mọi comment
        // STAFF/USER chỉ delete comment của chính mình
        if (role !== Role.ADMIN && comment.userId !== userId) {
            throw new ForbiddenException('Chỉ được delete comment của chính mình');
        }

        await this.commentRepo.softDelete(commentId);
        return { message: 'Deleted' };
    }
    // HARD DELETE – xóa vĩnh viễn, chỉ admin
    async hardDelete(commentId: string, userId: string, role: Role) {
        const comment = await this.commentRepo.findOneBy({ id: commentId });
        if (!comment) throw new NotFoundException('Comment không tồn tại');

        // Chỉ admin mới xóa cứng
        if (role !== Role.ADMIN) {
            throw new ForbiddenException('Chỉ admin mới có quyền hard delete comment');
        }

        await this.commentRepo.delete(commentId);  // xóa vĩnh viễn khỏi DB
        return { message: 'Comment đã bị xóa vĩnh viễn' };
    }
    // Top user nhiều comment + like nhất (DESC), và ít nhất (ASC)
    async getTopUsers(order: 'ASC' | 'DESC' = 'DESC', limit = 10) {
        return this.commentRepo
            .createQueryBuilder('comment')
            .select('comment.userId', 'userId')
            .addSelect('user.fullName', 'fullName')
            .addSelect('COUNT(comment.id)', 'commentCount')
            .addSelect('SUM(comment.likes)', 'totalLikes')
            .addSelect('COUNT(comment.id) + SUM(comment.likes)', 'totalInteraction')
            .leftJoin('comment.user', 'user')
            .groupBy('comment.userId, user.fullName')
            .orderBy('totalInteraction', order)  // DESC: nhiều nhất, ASC: ít nhất
            .limit(limit)
            .getRawMany();
    }

    // Top product nhiều tương tác nhất
    async getTopProducts(order: 'ASC' | 'DESC' = 'DESC', limit = 10) {
        return this.commentRepo
            .createQueryBuilder('comment')
            .select('comment.productId', 'productId')
            .addSelect('product.productName', 'productName')
            .addSelect('COUNT(comment.id)', 'commentCount')
            .addSelect('SUM(comment.likes)', 'totalLikes')
            .addSelect('COUNT(comment.id) + SUM(comment.likes)', 'totalInteraction')
            .leftJoin('comment.product', 'product')
            .groupBy('comment.productId, product.productName')
            .orderBy('totalInteraction', order)
            .limit(limit)
            .getRawMany();
    }
}