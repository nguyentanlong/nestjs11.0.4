
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../users/entities/user.entity';
import { BlacklistService } from './blacklist.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule để đọc biến môi trường từ .env
    ConfigModule.forRoot({
      isGlobal: true, // cho phép dùng ở mọi module mà không cần import lại
    }),

    // Kết nối entity User với TypeORM
    TypeOrmModule.forFeature([User]),

    // Đăng ký JwtModule bằng ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule], // cần import để inject ConfigService
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // lấy từ .env
        signOptions: { expiresIn: '1h' }, // thời gian sống của token
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, BlacklistService],
  exports: [JwtStrategy],
})
export class AuthModule { }