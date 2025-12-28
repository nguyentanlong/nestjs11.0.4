import { Controller, Post, Patch, Get, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/enum.role';
import { Request } from 'express';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { PartialActionDto } from './dto/partial-action.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    async create(
        @Body() dto: CreateOrderDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.ordersService.create(dto, req.user.id);
    }

    @Patch(':id/cancel')
    async cancel(
        @Param('id') orderId: string,
        @Body('reason') reason: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.ordersService.cancel(orderId, req.user.id, req.user.role, reason);
    }

    @Patch(':id/return')
    async returnOrder(
        @Param('id') orderId: string,
        @Body('reason') reason: string,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.ordersService.return(orderId, req.user.id, req.user.role, reason);
    }
    @Patch(':id/partial-cancel')
    @UseGuards(JwtAuthGuard)
    async partialCancel(
        @Param('id') orderId: string,
        @Body() dto: PartialActionDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.ordersService.partialAction(orderId, 'cancel', dto, req.user.id, req.user.role);
    }

    @Patch(':id/partial-return')
    @UseGuards(JwtAuthGuard)
    async partialReturn(
        @Param('id') orderId: string,
        @Body() dto: PartialActionDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.ordersService.partialAction(orderId, 'return', dto, req.user.id, req.user.role);
    }
    @Get('top-products')
    async topProducts(@Query('limit') limit = 10) {
        return this.ordersService.topProducts(limit);
    }

    @Get('top-users')
    async topUsers(@Query('limit') limit = 10) {
        return this.ordersService.topUsers(limit);
    }

    @Get('top-cancel-users')
    async topCancelUsers(@Query('limit') limit = 10) {
        return this.ordersService.topCancelUsers(limit);
    }

    @Get('top-return-products')
    async topReturnProducts(@Query('limit') limit = 10) {
        return this.ordersService.topReturnProducts(limit);
    }
}