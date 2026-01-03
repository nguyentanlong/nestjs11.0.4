import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
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
import { Order } from './modules/orders/entities/order.entity';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', }),//thêm để đọc được .env
    TypeOrmModule.forRoot({
      // type: 'postgres',
      // host: 'localhost',
      // port: 5432,
      // username: 'postgres',
      // password: '123456',           // sửa nếu đệ dùng pass khác
      // database: 'muamuaclone',
      type: 'better-sqlite3',        // đổi thành sqlite siêu nhanh
      database: 'Database.db',   // tự động tạo file .db trong thư mục dự án
      entities: [User, Product, Comment, Order],             // vẫn để vậy là được
      //start cho build
      autoLoadEntities: true,  // THÊM DÒNG NÀY – tự load relation
      synchronize: false,  // production tắt
      migrations: [__dirname + '/migrations/*.js'],  // nếu dùng migration
      migrationsRun: true,
      //end cho build
      // synchronize: true,//tự tạo bảng
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    //thêm sản phẩm
    ProductsModule,
    TypeOrmModule.forFeature([Product]),
    CommentsModule,
    OrdersModule,
    MailModule
  ],
  // providers: [CloudinaryProvider],
})
export class AppModule { }