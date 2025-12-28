import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Role } from '../../common/enums/enum.role';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) { }

  async create(dto: CreateOrderDto, userId: string) {
    const order = this.orderRepo.create({
      userId,
      products: dto.products,
      totalAmount: dto.totalAmount,
      status: 'pending',
      createdAt: new Date(),
    });
    return this.orderRepo.save(order);
  }

  async cancel(orderId: string, userId: string, role: Role, reason: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) throw new ForbiddenException('Không tìm thấy orders nhé ku');
    if (role !== Role.ADMIN && order.userId !== userId) throw new ForbiddenException('Chỉ chính chủ và admin mới được hủy');
    order.status = 'cancelled';
    order.cancelReason = reason;
    order.updatedAt = new Date();
    return this.orderRepo.save(order);
  }

  async return(orderId: string, userId: string, role: Role, reason: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) throw new ForbiddenException('Order ko được tìm thấy');
    if (role !== Role.ADMIN && order.userId !== userId) throw new ForbiddenException('Chỉ chính chủ mới xóa hủy đơn được');
    order.status = 'returned';
    order.returnReason = reason;
    order.updatedAt = new Date();
    return this.orderRepo.save(order);
  }

  // Top product bán nhiều nhất
  async topProducts(limit: number = 10) {
    return this.orderRepo
      .createQueryBuilder('order')
      .select('productId, SUM(quantity) as totalSold')
      .groupBy('productId')
      .orderBy('totalSold', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // Top user mua nhiều nhất
  async topUsers(limit: number = 10) {
    return this.orderRepo
      .createQueryBuilder('order')
      .select('userId, COUNT(id) as totalOrders, SUM(totalAmount) as totalSpent')
      .groupBy('userId')
      .orderBy('totalSpent', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // User bùng hàng nhiều nhất
  async topCancelUsers(limit: number = 10) {
    return this.orderRepo
      .createQueryBuilder('order')
      .select('userId, COUNT(id) as cancelCount')
      .where('status = :status', { status: 'cancelled' })
      .groupBy('userId')
      .orderBy('cancelCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  // Product bị trả nhiều nhất + lý do
  async topReturnProducts(limit: number = 10) {
    return this.orderRepo
      .createQueryBuilder('order')
      .select('productId, COUNT(id) as returnCount, returnReason')
      .where('status = :status', { status: 'returned' })
      .groupBy('productId, returnReason')
      .orderBy('returnCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}