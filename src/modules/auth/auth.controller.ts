import { BadRequestException, Controller, HttpCode, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBody } from '@nestjs/swagger';
import { LogoutDto } from './dto/logout.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerAvatarConfig } from 'src/up-files/multer.config';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // @Post('register')
    // async register(@Body() dto: RegisterDto) {
    //     return this.authService.register(dto);
    // }
    @Post('register')
    @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))
    async register(@Body() dto: RegisterDto, @UploadedFile() file?: Express.Multer.File) {
        return this.authService.register(dto, file);
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
