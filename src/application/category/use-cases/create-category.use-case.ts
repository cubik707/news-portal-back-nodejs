import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../../core/domain/category/entities/category.domain';
import {
  ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../core/domain/category/repositories/category.repository.interface';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(name: string): Promise<Category> {
    const category = Category.create(name);
    return this.categoryRepository.save(category);
  }
}
