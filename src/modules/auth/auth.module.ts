import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../users/entities/user.entity';
import { BlacklistService } from './blacklist.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from 'src/mail/mail.module';
import { VerificationToken } from './entities/verification-token.entity';

@Module({
  imports: [
    // ConfigModule để đọc biến môi trường từ .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailModule,

    // Khai báo cả User và VerificationToken để inject repository
    TypeOrmModule.forFeature([User, VerificationToken]),

    // Đăng ký JwtModule bằng ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, BlacklistService],
  exports: [JwtStrategy],
})
export class AuthModule { }
