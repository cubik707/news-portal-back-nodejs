import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../../../core/domain/comment/entities/comment.domain';
import {
  ICommentRepository,
  CommentWithNewsInfo,
} from '../../../../core/domain/comment/repositories/comment.repository.interface';
import { CommentOrmEntity } from '../entities/comment.orm-entity';
import { CommentMapper } from '../mappers/comment.mapper';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { NewsOrmEntity } from '../entities/news.orm-entity';

export class CommentTypeormRepository implements ICommentRepository {
  constructor(
    @InjectRepository(CommentOrmEntity)
    private readonly repo: Repository<CommentOrmEntity>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepo: Repository<UserOrmEntity>,
    @InjectRepository(NewsOrmEntity)
    private readonly newsRepo: Repository<NewsOrmEntity>,
  ) {}

  private get relations(): string[] {
    return ['author', 'author.userInfo', 'author.roles'];
  }

  async findAllByNewsId(newsId: string): Promise<Comment[]> {
    const entities = await this.repo.find({
      where: { news: { id: newsId } },
      order: { createdAt: 'ASC' },
      relations: this.relations,
    });
    return entities.map((e) => CommentMapper.toDomain(e));
  }

  async findLast(limit: number): Promise<Comment[]> {
    const entities = await this.repo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: this.relations,
    });
    return entities.map((e) => CommentMapper.toDomain(e));
  }

  async countByNewsId(newsId: string): Promise<number> {
    return this.repo.count({ where: { news: { id: newsId } } });
  }

  async findById(id: string): Promise<Comment | null> {
    const entity = await this.repo.findOne({ where: { id }, relations: this.relations });
    return entity ? CommentMapper.toDomain(entity) : null;
  }

  async findAllByAuthorId(authorId: string): Promise<CommentWithNewsInfo[]> {
    const entities = await this.repo.find({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
      relations: [...this.relations, 'news'],
    });
    return entities.map((e) => ({
      id: e.id,
      content: e.content,
      author: {
        id: e.author.id,
        username: e.author.username,
        firstName: e.author.userInfo?.firstName ?? '',
        lastName: e.author.userInfo?.lastName ?? '',
        avatarUrl: e.author.userInfo?.avatarUrl ?? undefined,
      },
      newsId: e.newsId,
      newsTitle: e.news.title,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      editedAt: e.editedAt ?? undefined,
    }));
  }

  async save(comment: Comment): Promise<Comment> {
    const author = await this.userRepo.findOne({
      where: { id: comment.author.id },
      relations: ['roles', 'userInfo'],
    });
    const news = await this.newsRepo.findOne({ where: { id: comment.newsId } });

    const entity = new CommentOrmEntity();
    entity.id = comment.id;
    entity.content = comment.content;
    entity.author = author!;
    entity.news = news!;
    entity.newsId = comment.newsId;
    entity.editedAt = comment.editedAt ?? null;

    const saved = await this.repo.save(entity);
    const found = await this.repo.findOne({ where: { id: saved.id }, relations: this.relations });
    return CommentMapper.toDomain(found!);
  }

  async update(comment: Comment): Promise<Comment> {
    const entity = await this.repo.findOne({
      where: { id: comment.id },
      relations: this.relations,
    });
    if (!entity) throw new Error(`Comment ${comment.id} not found`);

    entity.content = comment.content;
    entity.editedAt = comment.editedAt ?? null;

    await this.repo.save(entity);
    const updated = await this.repo.findOne({
      where: { id: comment.id },
      relations: this.relations,
    });
    return CommentMapper.toDomain(updated!);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
