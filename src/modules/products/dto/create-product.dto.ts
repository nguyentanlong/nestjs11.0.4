// DTO tạo sản phẩm
// export class CreateProductDto {
//     productName: string;
//     shortDescription: string;
//     description: string;
//     media: string[];
//     price: number;
//     stock: number;
// }
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsString()
    productName: string;

    @IsString()
    shortDescription: string;

    @IsString()
    description: string;

    @IsArray()
    @IsOptional()
    media: string[];

    @Type(() => Number) // ✅ ép kiểu từ string sang number
    @IsNumber()
    price: number;

    @Type(() => Number) // ✅ ép kiểu từ string sang number
    @IsNumber()
    stock: number;
}

// DTO cập nhật sản phẩm
export class UpdateProductDto {
    productName?: string;
    shortDescription?: string;
    description?: string;
    media?: string[];
    price?: number;
    stock?: number;
    editReason?: string;
}
