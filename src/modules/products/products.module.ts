import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Product])],
    controllers: [ProductsController],     // ← phải có dòng này
    providers: [ProductsService],
    exports: [ProductsService],             // ← thêm dòng này để module khác dùng được (nếu cần sau này)
})
export class ProductsModule { }