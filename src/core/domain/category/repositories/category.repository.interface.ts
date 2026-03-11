import { CategoryDomain } from '../entities/category.domain';

export interface ICategoryRepository {
  findAll(): Promise<CategoryDomain[]>;
  findById(id: number): Promise<CategoryDomain | null>;
  save(category: CategoryDomain): Promise<CategoryDomain>;
  update(id: number, category: CategoryDomain): Promise<CategoryDomain>;
  delete(id: number): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
