import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';

export class NewsUpdateDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  tagIds?: string[];

  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;
}
