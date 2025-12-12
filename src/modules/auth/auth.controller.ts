import { BadRequestException, Controller, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiBody } from '@nestjs/swagger';
import { LogoutDto } from './dto/logout.dto';




// @Controller('auth')
// export class AuthController {}
@Controller('auth')//Controller prefix: @Controller('auth') đặt tiền tố URL cho tất cả route trong class này. Tức là mọi handler bên trong sẽ bắt đầu bằng /auth, ví dụ: endpoint dưới đây là POST /auth/register.
export class AuthController {//khai báo một controller chịu trách nhiệm các endpoint liên quan đến xác thực (register, login…).
    constructor(private authService: AuthService) { }//cho phép NestJS tự động “tiêm” một instance của AuthService vào controller. Từ đó controller có thể gọi các phương thức nghiệp vụ như register().

    @Post('register')//register endpoint HTTP method và path: @Post('register')/register.html định nghĩa một route xử lý HTTP POST tại đường dẫn /auth/register. POST thường dùng cho tạo mới tài nguyên hoặc hành động ghi dữ liệu (đăng ký).
    async register(@Body() dto: RegisterDto) {//registerdto kiểm tra dữ liệu, tên hàm register(trong register(@body)) tự đặt phải giống với bên service
        return this.authService.register(dto);
    }/*
    @Body(): Lấy dữ liệu từ request body, chuyển thành một object phù hợp với RegisterDto. Nếu bạn đã bật ValidationPipe toàn cục hoặc tại route, dữ liệu sẽ được validate theo các decorator trong RegisterDto (ví dụ @IsEmail, @MinLength, @Matches…). Nếu sai, NestJS trả lỗi 400 mà không chạy tiếp vào service.

Kiểu dữ liệu DTO: Việc dùng RegisterDto giúp chuẩn hóa và kiểm soát dữ liệu đầu vào (validate, transform), giảm rủi ro nhận dữ liệu không hợp lệ.

Gọi service: this.authService.register(dto) chuyển phần xử lý nghiệp vụ đăng ký (kiểm tra trùng email/username, hash mật khẩu, lưu DB, tạo token nếu cần) sang tầng service để controller giữ vai trò mỏng, chỉ điều phối.

async/await: Đánh dấu hàm bất đồng bộ vì thao tác với DB hoặc mã hóa mật khẩu là bất đồng bộ. return ở đây trả về kết quả (ví dụ thông tin user hoặc access_token) cho client.
    */

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
    // LogOut thêm vào dưới cùng
    // @Post('logout')
    // @HttpCode(200)
    // async logout(@Body('refreshToken') refreshToken: string) {
    //     if (!refreshToken) {
    //         throw new BadRequestException('refreshToken là bắt buộc');
    //     }
    //     await this.authService.logout(refreshToken);
    //     return { message: 'Đăng xuất thành công, hẹn gặp lại đồng môn!' };
    // }
    @Post('logout')
    @HttpCode(200)
    @ApiBody({ type: LogoutDto }) // quan trọng: bảo Swagger hiện ô body
    async logout(@Body() dto: LogoutDto) {
        await this.authService.logout(dto.refreshToken);
        return { message: 'Đăng xuất thành công, hẹn gặp lại đồng môn!' };
    }
}
