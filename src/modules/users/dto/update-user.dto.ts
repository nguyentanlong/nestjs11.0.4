import { Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { Role } from "src/common/enums/enum.role";
import { DeleteDateColumn } from "typeorm";

// DTO dùng khi cập nhật user
export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string
    @IsOptional()
    @IsString()
    fullName?: string
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
    address?: string;
    @IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') {
            return 0;
        }
        return Number(value);
    })
    friendly: number;
    @IsOptional()
    @IsString()
    avatar?: string; // thêm trường avatar nếu cần
    @IsEnum(Role, { message: 'Role phải là admin, staff hoặc user' })
    @IsOptional()                  // bắt buộc optional
    role?: Role;                   // ? để TS biết có thể undefined
    // Thay đổi thành type tương thích SQLite
    @IsOptional()
    @DeleteDateColumn({
        type: 'datetime',   // hoặc 'text' nếu muốn, nhưng datetime tốt hơn
        nullable: true
    })
    deletedAt?: Date;

}
