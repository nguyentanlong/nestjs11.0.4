import { BadRequestException, Controller, HttpCode, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBody } from '@nestjs/swagger';
import { LogoutDto } from './dto/logout.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerAvatarConfig } from 'src/up-files/multer.config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Throttle } from '@nestjs/throttler';
import { EmailThrottlerGuard } from './guards/email-throttler.guard';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
        private readonly jwtService: JwtService,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
    ) { }


    @Post('register')
    @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))
    async register(@Body() dto: RegisterDto, @UploadedFile() file?: Express.Multer.File) {
        return this.authService.register(dto, file);
    }

    /*@Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        try {
            const payload = this.jwtService.verify(token, { secret: process.env.JWT_VERIFY_SECRET });
            const user = await this.userRepo.findOneBy({ id: payload.sub });

            if (!user) throw new BadRequestException('Token không hợp lệ');

            if (user.isEmailVerified) {
                return { message: 'Tài khoản đã được xác thực trước đó' };
            }

            user.isEmailVerified = true;
            await this.userRepo.save(user);

            return { message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay!' };
        } catch (error) {
            throw new BadRequestException('Token đã hết hạn hoặc không hợp lệ. Vui lòng đăng ký lại.');
        }
    }*/
    // Endpoint verify email: được gọi khi user click link trong mail 
    @Get('verify-email') async verifyEmail(@Query('token') token: string) { return this.authService.verifyEmail(token); }
    // (Tuỳ chọn) Resend verify email nếu cần 
    @Post('resend-verify') async resendVerify(@Body('email') email: string) { // Có thể tái sử dụng logic trong register khi user tồn tại nhưng chưa verify 
        return this.authService.forgotPassword(email);
    }// nếu bạn muốn tách riêng, tạo service resendVerifyEmail }
    @Throttle({ short: { limit: 5, ttl: 60000 } })  // 5 lần/phút
    @UseGuards(EmailThrottlerGuard)
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; newPassword: string }) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Request() req) {
        return req.user;
    }
    @Post('logout')
    @HttpCode(200)
    @ApiBody({ type: LogoutDto }) // quan trọng: bảo Swagger hiện ô body
    async logout(@Body() dto: LogoutDto) {
        await this.authService.logout(dto.refreshToken);
        return { message: 'Đăng xuất thành công, hẹn gặp lại đồng môn!' };
    }
}
