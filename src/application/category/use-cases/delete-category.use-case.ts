import { Inject, Injectable } from '@nestjs/common';
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../core/domain/category/repositories/category.repository.interface';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new CategoryNotFoundException(id);
    await this.categoryRepository.delete(id);
  }
}
