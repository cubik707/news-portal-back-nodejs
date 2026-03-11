import { Category } from '../entities/category.domain';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  save(category: Category): Promise<Category>;
  update(id: string, category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
