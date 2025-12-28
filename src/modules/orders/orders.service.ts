import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Role } from '../../common/enums/enum.role';
import { PartialActionDto } from './dto/partial-action.dto';

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
    if (!['pending', 'paid'].includes(order.status)) {
      throw new BadRequestException('Đơn hàng đã hủy/trả hoặc đang vận chuyển, không hủy được');
    }
    order.status = 'cancelled';
    order.cancelReason = reason;
    order.updatedAt = new Date();
    return this.orderRepo.save(order);
  }

  async return(orderId: string, userId: string, role: Role, reason: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId });
    if (!order) throw new ForbiddenException('Order ko được tìm thấy');
    if (role !== Role.ADMIN && order.userId !== userId) throw new ForbiddenException('Chỉ chính chủ mới xóa hủy đơn được');
    // Chỉ delivered mới return
    if (order.status !== 'delivered') {
      throw new BadRequestException('Chỉ đơn đã giao mới được trả hàng');
    }
    order.status = 'returned';
    order.returnReason = reason;
    order.updatedAt = new Date();
    return this.orderRepo.save(order);
    // await this.orderRepo.save(order);
    // return { message: 'Trả hàng thành công' };
  }
  async partialAction(
    orderId: string,
    action: 'cancel' | 'return',
    dto: PartialActionDto,
    userId: string,
    role: Role,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException('Order không tồn tại');

    // Check quyền: chỉ admin hoặc chính chủ
    if (role !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Chỉ admin hoặc chính chủ mới được thao tác');
    }

    // Check status hợp lệ cho action
    if (action === 'cancel' && !['pending', 'paid'].includes(order.status)) {
      throw new BadRequestException('Chỉ hủy được đơn pending hoặc paid');
    }
    if (action === 'return' && order.status !== 'delivered') {
      throw new BadRequestException('Chỉ trả được đơn đã giao');
    }

    let updated = false;
    dto.items.forEach(item => {
      const orderItem = order.products.find(p => p.productId === item.productId);
      if (!orderItem) throw new BadRequestException(`Sản phẩm ${item.productId} không có trong đơn`);

      if (item.quantity > orderItem.quantity) {
        throw new BadRequestException(`Số lượng ${item.quantity} lớn hơn số lượng đã mua (${orderItem.quantity})`);
      }

      orderItem.quantity -= item.quantity;
      order.totalAmount -= item.quantity * orderItem.price;
      updated = true;
    });

    // Xóa item quantity = 0
    order.products = order.products.filter(p => p.quantity > 0);

    if (updated) {
      order.status = action === 'cancel' ? 'partial_cancelled' : 'partial_returned';
      order[`${action}Reason`] = dto.reason;
      order.updatedAt = new Date();
      await this.orderRepo.save(order);
    }

    return { message: `${action === 'cancel' ? 'Hủy' : 'Trả'} một phần thành công`, order };
  }

  // Top product bán nhiều nhất
  // async topProducts(limit: number = 10) {
  //   return this.orderRepo
  //     .createQueryBuilder('order')
  //     .select('json_each.value', 'productId')
  //     .addSelect('COUNT(*)', 'totalOrders')
  //     .addSelect('SUM(json_each.quantity)', 'totalQuantity')
  //     .from('json_each(order.products)', 'json_each')
  //     .groupBy('json_each.value')
  //     .orderBy('totalQuantity', 'DESC')
  //     .limit(limit)
  //     .getRawMany();
  /*async topProducts(limit: number = 10) {
    // return this.orderRepo
    // .createQueryBuilder('order')
    // .select("JSON_EXTRACT(order.products, '$[*].productId')", 'productIds')// .select('productId, SUM(quantity) as totalSold')
    // .addSelect("SUM(JSON_EXTRACT(order.products, '$[*].quantity'))", 'totalSold')// add cot totalSold
    // .groupBy("JSON_EXTRACT(order.products, '$[*].productId')")// .groupBy('productId')
    // .orderBy('totalSold', 'DESC')
    // .limit(limit)
    // .getRawMany();
    return this.orderRepo.query(`
    SELECT 
  json_extract(json_each.value, '$.productId') AS productId,
  COUNT(*) AS totalOrders,
  SUM(json_extract(json_each.value, '$.quantity')) AS totalQuantity
FROM "order", json_each("order".products)
GROUP BY productId
ORDER BY totalQuantity DESC')
LIMIT ?;

  }*/
  async topProducts(limit: number = 10) {
    return this.orderRepo.query(`
    SELECT 
      json_extract(json_each.value, '$.productId') AS productId,
      COUNT(*) AS totalOrders,
      SUM(json_extract(json_each.value, '$.quantity')) AS totalQuantity
    FROM "order", json_each("order".products)
    GROUP BY productId
    ORDER BY totalQuantity DESC
    LIMIT ?;
  `, [limit]);
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
  // async topReturnProducts(limit: number = 10) {
  //   return this.orderRepo
  //     .createQueryBuilder('order')
  //     .select('productId, COUNT(id) as returnCount, returnReason')
  //     .where('status = :status', { status: 'returned' })
  //     .groupBy('productId, returnReason')
  //     .orderBy('returnCount', 'DESC')
  //     .limit(limit)
  //     .getRawMany();
  // }
  async topReturnProducts(limit: number = 10) {
    return this.orderRepo.query(`
    SELECT 
      json_extract(json_each.value, '$.productId') AS productId,
      COUNT(*) AS returnCount,
      json_extract(json_each.value, '$.reason') AS returnReason
    FROM "order", json_each("order".products)
    WHERE "order".status = 'returned'
    GROUP BY productId, returnReason
    ORDER BY returnCount DESC
    LIMIT ?;
  `, [limit]);
  }
}