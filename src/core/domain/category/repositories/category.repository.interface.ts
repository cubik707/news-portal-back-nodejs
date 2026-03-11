import { CategoryDomain } from '../entities/category.domain';

export interface ICategoryRepository {
  findAll(): Promise<CategoryDomain[]>;
  findById(id: number): Promise<CategoryDomain | null>;
  save(category: Partial<CategoryDomain>): Promise<CategoryDomain>;
  update(id: number, data: Partial<CategoryDomain>): Promise<CategoryDomain>;
  delete(id: number): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
