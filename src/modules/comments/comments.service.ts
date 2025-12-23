import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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
}