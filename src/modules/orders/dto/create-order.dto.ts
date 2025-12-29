import { IsArray, IsNumber, IsUUID, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()  // thêm price bắt buộc từ frontend hoặc backend fill
    price: number;  // giá lúc mua (snapshot)
}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    products: OrderItemDto[];

    @IsNumber()
    totalAmount: number;
}