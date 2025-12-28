import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { ProductsModule } from '../products/products.module';  // để check product tồn tại nếu cần

@Module({
    imports: [
        TypeOrmModule.forFeature([Order]),
        ProductsModule,  // nếu cần inject ProductsService
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],  // nếu module khác cần
})
export class OrdersModule { }