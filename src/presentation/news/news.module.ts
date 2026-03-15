import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { NewsController } from './news.controller';
import { CreateNewsUseCase } from '../../application/news/use-cases/create-news.use-case';
import { UpdateNewsUseCase } from '../../application/news/use-cases/update-news.use-case';
import { DeleteNewsUseCase } from '../../application/news/use-cases/delete-news.use-case';
import { GetAllNewsUseCase } from '../../application/news/use-cases/get-all-news.use-case';
import { GetNewsByIdUseCase } from '../../application/news/use-cases/get-news-by-id.use-case';
import { GetNewsByCategoryUseCase } from '../../application/news/use-cases/get-news-by-category.use-case';
import { GetNewsByStatusUseCase } from '../../application/news/use-cases/get-news-by-status.use-case';
import { GetNewsByStatusAndAuthorUseCase } from '../../application/news/use-cases/get-news-by-status-and-author.use-case';
import { GetNewsByCategoryAndStatusUseCase } from '../../application/news/use-cases/get-news-by-category-and-status.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [NewsController],
  providers: [
    CreateNewsUseCase,
    UpdateNewsUseCase,
    DeleteNewsUseCase,
    GetAllNewsUseCase,
    GetNewsByIdUseCase,
    GetNewsByCategoryUseCase,
    GetNewsByStatusUseCase,
    GetNewsByStatusAndAuthorUseCase,
    GetNewsByCategoryAndStatusUseCase,
  ],
})
export class NewsModule {}
