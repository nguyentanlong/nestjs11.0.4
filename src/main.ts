// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { ValidationPipe } from '@nestjs/common';
// import { v2 as cloudinary } from 'cloudinary';
// import { config } from 'dotenv';

// //upload file
// // ← THÊM 2 DÒNG NÀY LÊN ĐẦU TIÊN NHẤT
// config(); // ← load .env ngay khi app khởi động
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);



//   // QUAN TRỌNG NHẤT: BẬT TRANSFORM TOÀN CỤC – đây là chìa khóa vàng để lưu vào DB!
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//     }),
//   );
//   // Bật CORS (cho frontend gọi sau này)
//   app.enableCors();

//   // Bật validation toàn cục
//   app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
//   const config = new DocumentBuilder()
//     .setTitle('MuaMuaClone API')
//     .setDescription('API cho app mua sắm đệ làm cùng sư phụ')
//     .setVersion('1.0')
//     .addBearerAuth(
//       {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//         in: 'header',
//       },
//       'access-token', // ← TÊN NÀY PHẢI LÀ "access-token" HOẶC "JWT-auth" – KHÔNG ĐƯỢC ĐỂ TRỐNG!!!
//     )
//     .build();

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('api', app, document, {
//     swaggerOptions: {
//       persistAuthorization: true, // giữ token khi F5
//     },
//   });

//   await app.listen(3000);
//   console.log(`Application is running on: http://localhost:3000/api`);
// }
// bootstrap();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';// cho upfile
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Cho phép truy cập file tĩnh trong thư mục uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Bật ValidationPipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // loại bỏ field thừa không có trong DTO
      forbidNonWhitelisted: true, // báo lỗi nếu có field thừa
      transform: true, // tự động transform kiểu dữ liệu (string -> number)
    }),
  );

  await app.listen(3000);
}
bootstrap();
