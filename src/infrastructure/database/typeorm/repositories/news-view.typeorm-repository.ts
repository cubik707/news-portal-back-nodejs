import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { INewsViewRepository } from '../../../../core/domain/news-view/repositories/news-view.repository.interface';
import { NewsViewOrmEntity } from '../entities/news-view.orm-entity';

@Injectable()
export class NewsViewTypeormRepository implements INewsViewRepository {
  constructor(
    @InjectRepository(NewsViewOrmEntity)
    private readonly repo: Repository<NewsViewOrmEntity>,
  ) {}

  async upsert(newsId: string, userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(NewsViewOrmEntity)
      .values({ newsId, userId })
      .orIgnore()
      .execute();
  }
}
