import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { ICategoryRepository } from '../../../../core/domain/category/repositories/category.repository.interface';
import { Category } from '../../../../core/domain/category/entities/category.domain';
import { CategoryMapper } from '../mappers/category.mapper';

export class CategoryTypeormRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async findAll(): Promise<Category[]> {
    const entities = await this.repo.find();
    return entities.map((e) => CategoryMapper.toDomain(e));
  }

  async findById(id: string): Promise<Category | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? CategoryMapper.toDomain(entity) : null;
  }

  async save(category: Category): Promise<Category> {
    const entity = this.repo.create({ id: category.id, name: category.name });
    const saved = await this.repo.save(entity);
    return CategoryMapper.toDomain(saved);
  }

  async update(id: string, category: Category): Promise<Category> {
    await this.repo.update(id, { name: category.name });
    const updated = await this.repo.findOne({ where: { id } });
    return CategoryMapper.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
