import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateCommentDto {
    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}