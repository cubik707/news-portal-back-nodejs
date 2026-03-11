import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { ICategoryRepository } from '../../../../core/domain/category/repositories/category.repository.interface';
import { CategoryDomain } from '../../../../core/domain/category/entities/category.domain';
import { CategoryMapper } from '../mappers/category.mapper';

export class CategoryTypeormRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async findAll(): Promise<CategoryDomain[]> {
    const entities = await this.repo.find();
    return entities.map(CategoryMapper.toDomain);
  }

  async findById(id: number): Promise<CategoryDomain | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? CategoryMapper.toDomain(entity) : null;
  }

  async save(category: Partial<CategoryDomain>): Promise<CategoryDomain> {
    const entity = this.repo.create({ name: category.name });
    const saved = await this.repo.save(entity);
    return CategoryMapper.toDomain(saved);
  }

  async update(
    id: number,
    data: Partial<CategoryDomain>,
  ): Promise<CategoryDomain> {
    await this.repo.update(id, { name: data.name });
    const updated = await this.repo.findOne({ where: { id } });
    return CategoryMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
