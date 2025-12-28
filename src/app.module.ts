import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// ĐỔI DÒNG NÀY THÀNH ĐÚNG ĐƯỜNG DẪN HIỆN TẠI CỦA ĐỆ
import { User } from './modules/users/entities/user.entity';  // ← Đúng rồi nè!

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
//thêm sản phẩm
import { ProductsModule } from './modules/products/products.module';
// import { CloudinaryProvider } from './config/cloudinary.config';
import { Product } from './modules/products/entities/product.entity';
import { ConfigModule } from '@nestjs/config';
import { Comment } from './modules/comments/entities/comment.entity';
import { CommentsModule } from './modules/comments/comments.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),//thêm để đọc được .env
    TypeOrmModule.forRoot({
      // type: 'postgres',
      // host: 'localhost',
      // port: 5432,
      // username: 'postgres',
      // password: '123456',           // sửa nếu đệ dùng pass khác
      // database: 'muamuaclone',
      type: 'better-sqlite3',        // đổi thành sqlite siêu nhanh
      database: 'Database.db',   // tự động tạo file .db trong thư mục dự án
      entities: [User, Product, Comment],             // vẫn để vậy là được
      synchronize: true,//tự tạo bảng
    }),
    UsersModule,
    AuthModule,
    //thêm sản phẩm
    ProductsModule,
    TypeOrmModule.forFeature([Product]),
    CommentsModule,
    OrdersModule
  ],
  // providers: [CloudinaryProvider],
})
export class AppModule { }