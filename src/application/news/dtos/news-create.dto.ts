import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { NewsStatus } from '../../../core/shared/enums/news-status.enum';

export class NewsCreateDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  tagIds?: string[];

  @IsEnum(NewsStatus)
  @IsOptional()
  status?: NewsStatus;
}
