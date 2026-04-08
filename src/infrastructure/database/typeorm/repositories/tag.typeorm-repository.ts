import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { TagOrmEntity } from '../entities/tag.orm-entity';
import { ITagRepository } from '../../../../core/domain/tag/repositories/tag.repository.interface';
import { Tag } from '../../../../core/domain/tag/entities/tag.domain';
import { TagMapper } from '../mappers/tag.mapper';

export class TagTypeormRepository implements ITagRepository {
  constructor(
    @InjectRepository(TagOrmEntity)
    private readonly repo: Repository<TagOrmEntity>,
  ) {}

  async findAll(): Promise<Tag[]> {
    const entities = await this.repo.find();
    return entities.map((e) => TagMapper.toDomain(e));
  }

  async findById(id: string): Promise<Tag | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? TagMapper.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) return [];
    const entities = await this.repo.findBy(ids.map((id) => ({ id })));
    return entities.map((e) => TagMapper.toDomain(e));
  }

  async findLastThree(): Promise<Tag[]> {
    const entities = await this.repo.find({ order: { id: 'DESC' }, take: 3 });
    return entities.map((e) => TagMapper.toDomain(e));
  }

  async save(tag: Tag): Promise<Tag> {
    const entity = this.repo.create({ id: tag.id, name: tag.name });
    const saved = await this.repo.save(entity);
    return TagMapper.toDomain(saved);
  }

  async findOrCreateByNames(names: string[]): Promise<Tag[]> {
    if (names.length === 0) return [];

    const existing = await this.repo.find({ where: { name: In(names) } });
    const existingNames = new Set(existing.map((e) => e.name));

    const newEntities: TagOrmEntity[] = [];
    for (const name of names) {
      if (!existingNames.has(name)) {
        newEntities.push(this.repo.create({ id: randomUUID(), name }));
      }
    }

    if (newEntities.length > 0) {
      await this.repo.save(newEntities);
    }

    return [...existing, ...newEntities].map((e) => TagMapper.toDomain(e));
  }
}
