import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export enum NewsSortBy {
  publishedAt = 'publishedAt',
  title = 'title',
  likeCount = 'likeCount',
}

export class NewsPublishedFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(NewsSortBy)
  sortBy?: NewsSortBy;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  tagIds?: string[];

  @IsOptional()
  @IsUUID('4')
  categoryId?: string;
}
