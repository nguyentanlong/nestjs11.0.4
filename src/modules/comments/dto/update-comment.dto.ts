import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateCommentDto {
    @IsString()
    content: string;

    @IsOptional()
    @IsString()
    parentId?: string;  // for reply

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];  // e.g. ['@user1']
}