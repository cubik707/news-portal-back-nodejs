import { Category } from '../../../core/domain/category/entities/category.domain';

export class CategoryResponseDto {
  id!: string;
  name!: string;

  static fromDomain(this: void, category: Category): CategoryResponseDto {
    const dto = new CategoryResponseDto();
    dto.id = category.id;
    dto.name = category.name;
    return dto;
  }
}
