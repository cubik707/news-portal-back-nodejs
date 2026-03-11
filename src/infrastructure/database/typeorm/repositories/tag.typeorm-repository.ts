import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TagOrmEntity } from '../entities/tag.orm-entity';
import { ITagRepository } from '../../../../core/domain/tag/repositories/tag.repository.interface';
import { TagDomain } from '../../../../core/domain/tag/entities/tag.domain';
import { TagMapper } from '../mappers/tag.mapper';

export class TagTypeormRepository implements ITagRepository {
  constructor(
    @InjectRepository(TagOrmEntity)
    private readonly repo: Repository<TagOrmEntity>,
  ) {}

  async findAll(): Promise<TagDomain[]> {
    const entities = await this.repo.find();
    return entities.map(TagMapper.toDomain);
  }

  async findById(id: number): Promise<TagDomain | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? TagMapper.toDomain(entity) : null;
  }

  async findLastThree(): Promise<TagDomain[]> {
    const entities = await this.repo.find({
      order: { id: 'DESC' },
      take: 3,
    });
    return entities.map(TagMapper.toDomain);
  }

  async save(tag: Partial<TagDomain>): Promise<TagDomain> {
    const entity = this.repo.create({ name: tag.name });
    const saved = await this.repo.save(entity);
    return TagMapper.toDomain(saved);
  }
}
