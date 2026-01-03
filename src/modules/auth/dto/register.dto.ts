import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
    @IsEmail({}, { message: 'Email không hợp lệ rồi ku' }) email: string;
    @IsNotEmpty({ message: 'Không được để trống username nha ku' }) username: string;
    @IsNotEmpty({ message: 'Không được để trống sđt nha ku' }) phone: string;
    @IsNotEmpty({ message: 'Không được để trống địa chỉ nha ku' }) address: string;
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
     @IsOptional() @IsString() @Transform(({ value }) => {
        if (value === undefined || value === null || value === '') {
            return 'user';
        }
        return value;
    })
    role: string;*///@IsOptional() @IsString() @Transform(({ value }) => value ?? 'khách hàng') role: string;
    @IsOptional()
    @IsString()
    avatar?: string;

    //   @IsOptional()
    //   @IsNumber()
    //   friendly?: number;

}