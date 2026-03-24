import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../../core/domain/category/entities/category.domain';
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../core/domain/category/repositories/category.repository.interface';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';

@Injectable()
export class GetCategoryByIdUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new CategoryNotFoundException(id);
    return category;
  }
}
