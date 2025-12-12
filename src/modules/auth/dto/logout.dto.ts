// src/modules/auth/dto/logout.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxx',
        description: 'Refresh token nhận được khi login',
    })
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}