import { Inject, Injectable } from '@nestjs/common';
import { Category } from '../../../core/domain/category/entities/category.domain';
import {
  type ICategoryRepository,
  CATEGORY_REPOSITORY,
} from '../../../core/domain/category/repositories/category.repository.interface';

@Injectable()
export class GetAllCategoriesUseCase {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}
