import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/enum.role';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { Request } from 'express';
// import { ProductsService } from '../products/products.service';

@Controller('products/:productId/comments')
// bắt buộc login tất cả
export class CommentsController {
    constructor(private readonly commentsService: CommentsService,
        // private readonly productsService: ProductsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Param('productId') productId: string,
        @Body() dto: CreateCommentDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.create(productId, dto, req.user.id, req.user.role, dto.parentId);
    }
    /*@UseGuards(JwtAuthGuard)
    @Post(':id/like')
    async like(
        @Param('id') id: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.like(id, req.user.id);
    }
    @UseGuards(JwtAuthGuard)
    @Post(':id/unlike')
    async unlike(
        @Param('id') id: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.unlike(id, req.user.id);
    }*/
    @Post(':id/toggle-like')
    @UseGuards(JwtAuthGuard)
    async toggleLike(
        @Param('id') commentId: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.toggleLike(commentId, req.user.id);
    }
    // @Post(':id/toggle-like')
    // @UseGuards(JwtAuthGuard)
    // async toggleLikeProduct(
    //     @Param('id') productId: string,
    //     @Req() req: Request & { user: JwtPayload },
    // ) {
    //     return this.productsService.toggleLikeProduct(productId, req.user.id);
    // }
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCommentDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.update(id, dto, req.user.id, req.user.role);
    }
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @Roles(Role.ADMIN)  // admin full CRUD
    @UseGuards(RolesGuard)  // thêm để check role + ownership
    async delete(
        @Param('id') id: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.commentsService.delete(id, req.user.id, req.user.role);
    }
    @Get('top-users')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async topUsers(@Query('order') order: 'ASC' | 'DESC' = 'DESC', @Query('limit') limit = 10) {
        return this.commentsService.getTopUsers(order, +limit);
    }

    @Get('top-products')
    async topProducts(@Query('order') order: 'ASC' | 'DESC' = 'DESC', @Query('limit') limit = 10) {
        return this.commentsService.getTopProducts(order, +limit);
    }
}