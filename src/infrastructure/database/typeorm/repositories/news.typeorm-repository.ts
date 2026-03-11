import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NewsOrmEntity } from '../entities/news.orm-entity';
import { INewsRepository } from '../../../../core/domain/news/repositories/news.repository.interface';
import { NewsDomain } from '../../../../core/domain/news/entities/news.domain';
import { NewsStatus } from '../../../../core/shared/enums/news-status.enum';
import { NewsMapper } from '../mappers/news.mapper';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { TagOrmEntity } from '../entities/tag.orm-entity';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { InjectRepository as InjectRepo } from '@nestjs/typeorm';

export class NewsTypeormRepository implements INewsRepository {
  constructor(
    @InjectRepository(NewsOrmEntity)
    private readonly repo: Repository<NewsOrmEntity>,
    @InjectRepo(CategoryOrmEntity)
    private readonly categoryRepo: Repository<CategoryOrmEntity>,
    @InjectRepo(TagOrmEntity)
    private readonly tagRepo: Repository<TagOrmEntity>,
    @InjectRepo(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
  ) {}

  private get relations(): string[] {
    return ['author', 'author.userInfo', 'author.roles', 'category', 'tags'];
  }

  async findAll(): Promise<NewsDomain[]> {
    const entities = await this.repo.find({ relations: this.relations });
    return entities.map(NewsMapper.toDomain);
  }

  async findById(id: number): Promise<NewsDomain | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: this.relations,
    });
    return entity ? NewsMapper.toDomain(entity) : null;
  }

  async findByCategory(categoryId: number): Promise<NewsDomain[]> {
    const entities = await this.repo.find({
      where: { category: { id: categoryId } },
      relations: this.relations,
    });
    return entities.map(NewsMapper.toDomain);
  }

  async findByStatus(status: NewsStatus): Promise<NewsDomain[]> {
    const entities = await this.repo.find({
      where: { status },
      relations: this.relations,
    });
    return entities.map(NewsMapper.toDomain);
  }

  async findByStatusAndAuthor(
    status: NewsStatus,
    authorId: number,
  ): Promise<NewsDomain[]> {
    const entities = await this.repo.find({
      where: { status, author: { id: authorId } },
      relations: this.relations,
    });
    return entities.map(NewsMapper.toDomain);
  }

  async findByCategoryAndStatus(
    categoryId: number,
    status: NewsStatus,
  ): Promise<NewsDomain[]> {
    const entities = await this.repo.find({
      where: { category: { id: categoryId }, status },
      relations: this.relations,
    });
    return entities.map(NewsMapper.toDomain);
  }

  async save(news: Partial<NewsDomain>): Promise<NewsDomain> {
    const author = await this.userRepo.findOne({
      where: { id: news.author?.id },
      relations: ['roles', 'userInfo'],
    });
    const category = await this.categoryRepo.findOne({
      where: { id: news.category?.id },
    });
    const tags =
      news.tags && news.tags.length > 0
        ? await this.tagRepo.findBy({ id: In(news.tags.map((t) => t.id)) })
        : [];

    const entity = new NewsOrmEntity();
    entity.title = news.title!;
    entity.content = news.content!;
    entity.image = news.image!;
    entity.status = news.status!;
    entity.publishedAt = news.publishedAt!;
    entity.scheduledAt = news.scheduledAt!;
    entity.author = author!;
    entity.category = category!;
    entity.tags = tags;

    const saved = await this.repo.save(entity);
    const found = await this.repo.findOne({
      where: { id: saved.id },
      relations: this.relations,
    });
    return NewsMapper.toDomain(found!);
  }

  async update(id: number, data: Partial<NewsDomain>): Promise<NewsDomain> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: this.relations,
    });
    if (!entity) throw new Error(`News ${id} not found`);

    if (data.title !== undefined) entity.title = data.title;
    if (data.content !== undefined) entity.content = data.content;
    if (data.image !== undefined) entity.image = data.image;
    if (data.status !== undefined) entity.status = data.status;
    if (data.publishedAt !== undefined) entity.publishedAt = data.publishedAt;
    if (data.scheduledAt !== undefined) entity.scheduledAt = data.scheduledAt;

    if (data.category?.id !== undefined) {
      const cat = await this.categoryRepo.findOne({
        where: { id: data.category.id },
      });
      if (cat) entity.category = cat;
    }

    if (data.tags !== undefined) {
      entity.tags =
        data.tags.length > 0
          ? await this.tagRepo.findBy({ id: In(data.tags.map((t) => t.id)) })
          : [];
    }

    await this.repo.save(entity);
    const updated = await this.repo.findOne({ where: { id }, relations: this.relations });
    return NewsMapper.toDomain(updated!);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
