import { IsOptional, IsPhoneNumber, IsString } from "class-validator";

// DTO dùng khi cập nhật user
export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string
    @IsOptional()
    @IsString()
    fullname?: string
    @IsOptional()
    @IsString()
    @IsPhoneNumber('VN', { message: 'Sai đinh dạng số điện thoại VN nha ku, không hợp lệ' })
    phone: string;
    @IsOptional()
    @IsString()
    email?: string; // có thể đổi email
    @IsOptional()
    @IsString()
    password?: string; // có thể đổi mật khẩu (sẽ hash lại)
    @IsOptional()
    @IsString()
    avatar?: string; // thêm trường avatar nếu cần
}
