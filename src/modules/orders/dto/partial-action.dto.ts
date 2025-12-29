import { IsUUID, IsNumber, IsString, Min, Max, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class PartialItemDto {
    @IsUUID()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;  // số lượng muốn cancel/return


}

export class PartialActionDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PartialItemDto)
    productPartial: PartialItemDto[];


    @IsString()
    reason: string;
}