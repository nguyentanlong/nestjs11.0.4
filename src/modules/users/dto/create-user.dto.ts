// // DTO dùng khi tạo user mới
// export class CreateUserDto {
//     email: string; // email đăng nhập
//     password: string; // mật khẩu (sẽ được hash trong service)
//     role: 'admin' | 'staff' | 'user'; // phân quyền
// }
import { Transform } from 'class-transformer';
import { IsEmail, IsString, IsEnum, IsOptional, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { Role } from 'src/common/enums/enum.role';
import { RolesGuard } from 'src/common/guards/roles.guard';
// điều chỉnh đường dẫn enum role của đệ

export class CreateUserDto {
    @IsEmail({}, { message: 'Email không hợp lệ rồi ku' }) email: string;
    @IsNotEmpty({ message: 'Không được để trống username nha ku' }) username: string;
    @IsNotEmpty({ message: 'Không được để trống sđt nha ku' }) phone: string;
    @IsNotEmpty({ message: 'Không được để trống địa chỉ nha ku' }) address: string;
    // Các field khác giống RegisterDto...
    @IsNotEmpty() @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' }) @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*()-=_+|{}'",.])[A-Za-z\d@$!%*?&+]{8,}$/
        ,
        {
            message:
                'Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ in hoa, 1 số và 1 ký tự đặc biệt',
        },
    ) password: string;
    @IsNotEmpty({ message: 'Không được để trống tên đầy đủ nha ku' }) fullName: string;
    // @IsOptional() friendly?: number;
    /*@IsOptional()
    @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') {
            return 0;
        }
        return Number(value);
    })
    friendly: number;
    @IsEnum(Role, { message: 'Role phải là admin, staff hoặc user' })
    role: Role;  // type là Role (enum)  // quan trọng: admin mới được set cái này!*/
    @IsOptional()
    @IsString()
    avatar?: string;
}