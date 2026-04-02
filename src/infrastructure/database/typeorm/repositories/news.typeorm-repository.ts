import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NewsOrmEntity } from '../entities/news.orm-entity';
import { INewsRepository } from '../../../../core/domain/news/repositories/news.repository.interface';
import { News } from '../../../../core/domain/news/entities/news.domain';
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

  async findAll(): Promise<News[]> {
    const entities = await this.repo.find({ relations: this.relations });
    return entities.map((e) => NewsMapper.toDomain(e));
  }

  async findById(id: string): Promise<News | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    return entity ? NewsMapper.toDomain(entity) : null;
  }

  async findByCategory(categoryId: string): Promise<News[]> {
    const entities = await this.repo.find({
      where: { category: { id: categoryId } },
      relations: this.relations,
    });
    return entities.map((e) => NewsMapper.toDomain(e));
  }

  async findByStatus(status: NewsStatus): Promise<News[]> {
    const entities = await this.repo.find({ where: { status }, relations: this.relations });
    return entities.map((e) => NewsMapper.toDomain(e));
  }

  async findByStatusAndAuthor(status: NewsStatus, authorId: string): Promise<News[]> {
    const entities = await this.repo.find({
      where: { status, author: { id: authorId } },
      relations: this.relations,
    });
    return entities.map((e) => NewsMapper.toDomain(e));
  }

  async findByCategoryAndStatus(categoryId: string, status: NewsStatus): Promise<News[]> {
    const entities = await this.repo.find({
      where: { category: { id: categoryId }, status },
      relations: this.relations,
    });
    return entities.map((e) => NewsMapper.toDomain(e));
  }

  async save(news: News): Promise<News> {
    const author = await this.userRepo.findOne({
      where: { id: news.author.id },
      relations: ['roles', 'userInfo'],
    });
    const category = await this.categoryRepo.findOne({
      where: { id: news.category.id },
    });
    const tagIds = news.tags.map((t) => t.id).filter(Boolean);
    const tags = tagIds.length > 0 ? await this.tagRepo.findBy({ id: In(tagIds) }) : [];

    const entity = new NewsOrmEntity();
    entity.id = news.id;
    entity.title = news.title;
    entity.content = news.content;
    entity.image = news.image!;
    entity.status = news.status;
    entity.publishedAt = news.publishedAt!;
    entity.scheduledAt = news.scheduledAt!;
    entity.author = author!;
    entity.category = category!;
    entity.tags = tags;

    const saved = await this.repo.save(entity);
    const found = await this.repo.findOne({ where: { id: saved.id }, relations: this.relations });
    return NewsMapper.toDomain(found!);
  }

  async update(id: string, news: News): Promise<News> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    if (!entity) throw new Error(`News ${id} not found`);

    entity.title = news.title;
    entity.content = news.content;
    entity.image = news.image!;
    entity.status = news.status;
    entity.publishedAt = news.publishedAt!;
    entity.scheduledAt = news.scheduledAt!;

    const category = await this.categoryRepo.findOne({ where: { id: news.category.id } });
    if (category) entity.category = category;

    const tagIds = news.tags.map((t) => t.id).filter(Boolean);
    entity.tags = tagIds.length > 0 ? await this.tagRepo.findBy({ id: In(tagIds) }) : [];

    await this.repo.save(entity);
    const updated = await this.repo.findOne({ where: { id }, relations: this.relations });
    return NewsMapper.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
