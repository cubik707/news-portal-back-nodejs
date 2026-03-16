import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateNewsUseCase } from '../../application/news/use-cases/create-news.use-case';
import { UpdateNewsUseCase } from '../../application/news/use-cases/update-news.use-case';
import { DeleteNewsUseCase } from '../../application/news/use-cases/delete-news.use-case';
import { GetAllNewsUseCase } from '../../application/news/use-cases/get-all-news.use-case';
import { GetNewsByIdUseCase } from '../../application/news/use-cases/get-news-by-id.use-case';
import { GetNewsByCategoryUseCase } from '../../application/news/use-cases/get-news-by-category.use-case';
import { GetNewsByStatusUseCase } from '../../application/news/use-cases/get-news-by-status.use-case';
import { GetNewsByStatusAndAuthorUseCase } from '../../application/news/use-cases/get-news-by-status-and-author.use-case';
import { GetNewsByCategoryAndStatusUseCase } from '../../application/news/use-cases/get-news-by-category-and-status.use-case';
import { NewsCreateDto } from '../../application/news/dtos/news-create.dto';
import { NewsUpdateDto } from '../../application/news/dtos/news-update.dto';
import { NewsResponseDto } from '../../application/news/dtos/news-response.dto';
import { NewsStatus } from '../../core/shared/enums/news-status.enum';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';
import type { JwtUserPayload } from '../auth/jwt.strategy';

@Controller('news')
export class NewsController {
  constructor(
    private readonly getAllNews: GetAllNewsUseCase,
    private readonly getNewsById: GetNewsByIdUseCase,
    private readonly getNewsByCategory: GetNewsByCategoryUseCase,
    private readonly getNewsByStatus: GetNewsByStatusUseCase,
    private readonly getNewsByStatusAndAuthor: GetNewsByStatusAndAuthorUseCase,
    private readonly getNewsByCategoryAndStatus: GetNewsByCategoryAndStatusUseCase,
    private readonly createNews: CreateNewsUseCase,
    private readonly updateNews: UpdateNewsUseCase,
    private readonly deleteNews: DeleteNewsUseCase,
  ) {}

  @Get()
  async findAll(): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const news = await this.getAllNews.execute();
    return new SuccessResponseDto(
      news.map((n) => NewsResponseDto.fromDomain(n)),
      'News retrieved',
    );
  }

  // Declare static routes BEFORE parameterized :id to avoid conflicts
  @Get('status')
  async findByStatus(
    @Query('status') status: NewsStatus,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const news = await this.getNewsByStatus.execute(status);
    return new SuccessResponseDto(
      news.map((n) => NewsResponseDto.fromDomain(n)),
      'News retrieved',
    );
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const news = await this.getNewsByCategory.execute(categoryId);
    return new SuccessResponseDto(
      news.map((n) => NewsResponseDto.fromDomain(n)),
      'News retrieved',
    );
  }

  @Get('category/:categoryId/status')
  async findByCategoryAndStatus(
    @Param('categoryId') categoryId: string,
    @Query('status') status: NewsStatus,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const news = await this.getNewsByCategoryAndStatus.execute(categoryId, status);
    return new SuccessResponseDto(
      news.map((n) => NewsResponseDto.fromDomain(n)),
      'News retrieved',
    );
  }

  @Get('author/:authorId/status')
  async findByStatusAndAuthor(
    @Param('authorId') authorId: string,
    @Query('status') status: NewsStatus,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const news = await this.getNewsByStatusAndAuthor.execute(authorId, status);
    return new SuccessResponseDto(
      news.map((n) => NewsResponseDto.fromDomain(n)),
      'News retrieved',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<NewsResponseDto>> {
    const news = await this.getNewsById.execute(id);
    return new SuccessResponseDto(NewsResponseDto.fromDomain(news), 'News retrieved');
  }

  @Post()
  @UseGuards(JwtAuthGuard, ApprovedGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  async create(
    @Body() dto: NewsCreateDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto>> {
    const news = await this.createNews.execute({
      title: dto.title,
      content: dto.content,
      image: dto.image,
      authorId: user.id,
      categoryId: dto.categoryId,
      tagIds: dto.tagIds,
      status: dto.status,
    });
    return new SuccessResponseDto(NewsResponseDto.fromDomain(news), 'News created');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ApprovedGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  async update(
    @Param('id') id: string,
    @Body() dto: NewsUpdateDto,
  ): Promise<SuccessResponseDto<NewsResponseDto>> {
    const news = await this.updateNews.execute({
      id,
      title: dto.title,
      content: dto.content,
      image: dto.image,
      categoryId: dto.categoryId,
      tagIds: dto.tagIds,
      status: dto.status,
    });
    return new SuccessResponseDto(NewsResponseDto.fromDomain(news), 'News updated');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ApprovedGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<SuccessResponseDto<null>> {
    await this.deleteNews.execute(id);
    return new SuccessResponseDto(null, 'News deleted');
  }
}
