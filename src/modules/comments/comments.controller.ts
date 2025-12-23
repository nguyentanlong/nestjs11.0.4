import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/enum.role';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { Request } from 'express';

@Controller('products/:productId/comments')
@UseGuards(JwtAuthGuard)  // bắt buộc login tất cả
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    async create(
        @Param('productId') productId: string,
        @Body() dto: CreateCommentDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.create(productId, dto, req.user.id, req.user.role, dto.parentId);
    }

    @Post(':id/like')
    async like(
        @Param('id') id: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.like(id, req.user.id);
    }

    @Post(':id/unlike')
    async unlike(
        @Param('id') id: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.unlike(id, req.user.id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCommentDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.update(id, dto, req.user.id, req.user.role);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)  // admin full CRUD
    @UseGuards(RolesGuard)  // thêm để check role + ownership
    async delete(
        @Param('id') id: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.delete(id, req.user.id, req.user.role);
    }
}