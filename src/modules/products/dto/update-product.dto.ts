// import { PartialType } from '@nestjs/mapped-types';
// import { CreateProductDto } from './create-product.dto';

// export class UpdateProductDto extends PartialType(CreateProductDto) {
//     editReason?: string;
// }
// src/products/dto/update-product.dto.ts
// import { IsString, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';
// import { Type } from 'class-transformer';

// export class UpdateProductDtoMoi {
//     @IsOptional()
//     @IsString()
//     productName?: string;

//     @IsOptional()
//     @IsString()
//     shortDescription?: string;

//     @IsOptional()
//     @IsString()
//     description?: string;

//     @IsOptional()
//     @IsArray()
//     media?: string[];

//     @IsOptional()
//     @Type(() => Number)
//     @IsNumber()
//     price?: number;

//     @IsOptional()
//     @Type(() => Number)
//     @IsNumber()
//     stock?: number;

//     @IsOptional()
//     @IsBoolean()
//     deleted?: boolean = false; // default value

//     @IsOptional()
//     @IsString()
//     editReason?: string;
// }
import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDtoMoi {
    // 📝 Tên sản phẩm (optional)
    @IsOptional()
    @IsString()
    productName?: string;

    // 📝 Mô tả ngắn (optional)
    @IsOptional()
    @IsString()
    shortDescription?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    keywords?: string[];

    // 📝 Mô tả chi tiết (optional)
    @IsOptional()
    @IsString()
    description?: string;

    // 🖼️ Danh sách media (ảnh/video/file) (optional)
    @IsOptional()
    @IsArray()
    media?: string[];

    // 💰 Giá sản phẩm (optional)
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    price?: number;

    // 📦 Số lượng tồn kho (optional)
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    stock?: number;

    // ✏️ Lý do chỉnh sửa (optional)
    @IsOptional()
    @IsString()
    editReason?: string;
}
