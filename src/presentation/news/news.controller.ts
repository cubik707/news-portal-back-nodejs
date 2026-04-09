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
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';
import type { JwtUserPayload } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
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
  async findAll(
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getAllNews.execute(user.id);
    return new SuccessResponseDto(
      items.map(({ news, commentCount, likeCount, isLikedByCurrentUser }) =>
        NewsResponseDto.fromDomain(news, commentCount, likeCount, isLikedByCurrentUser),
      ),
      'News retrieved',
    );
  }

  // Declare static routes BEFORE parameterized :id to avoid conflicts
  @Get('status')
  async findByStatus(
    @Query('status') status: NewsStatus,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getNewsByStatus.execute(status, user.id);
    return new SuccessResponseDto(
      items.map(({ news, commentCount, likeCount, isLikedByCurrentUser }) =>
        NewsResponseDto.fromDomain(news, commentCount, likeCount, isLikedByCurrentUser),
      ),
      'News retrieved',
    );
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getNewsByCategory.execute(categoryId, user.id);
    return new SuccessResponseDto(
      items.map(({ news, commentCount, likeCount, isLikedByCurrentUser }) =>
        NewsResponseDto.fromDomain(news, commentCount, likeCount, isLikedByCurrentUser),
      ),
      'News retrieved',
    );
  }

  @Get('category/:categoryId/status')
  async findByCategoryAndStatus(
    @Param('categoryId') categoryId: string,
    @Query('status') status: NewsStatus,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getNewsByCategoryAndStatus.execute(categoryId, status, user.id);
    return new SuccessResponseDto(
      items.map(({ news, commentCount, likeCount, isLikedByCurrentUser }) =>
        NewsResponseDto.fromDomain(news, commentCount, likeCount, isLikedByCurrentUser),
      ),
      'News retrieved',
    );
  }

  @Get('author/:authorId/status')
  async findByStatusAndAuthor(
    @Param('authorId') authorId: string,
    @Query('status') status: NewsStatus,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getNewsByStatusAndAuthor.execute(authorId, status, user.id);
    return new SuccessResponseDto(
      items.map(({ news, commentCount, likeCount, isLikedByCurrentUser }) =>
        NewsResponseDto.fromDomain(news, commentCount, likeCount, isLikedByCurrentUser),
      ),
      'News retrieved',
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto>> {
    const { news, commentCount, likeCount, isLikedByCurrentUser } =
      await this.getNewsById.execute(id, user.id);
    return new SuccessResponseDto(
      NewsResponseDto.fromDomain(news, commentCount, likeCount, isLikedByCurrentUser),
      'News retrieved',
    );
  }

  @Post()
  @UseGuards(ApprovedGuard, RolesGuard)
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
      tags: dto.tags,
      status: dto.status,
    });
    return new SuccessResponseDto(NewsResponseDto.fromDomain(news), 'News created');
  }

  @Put(':id')
  @UseGuards(ApprovedGuard, RolesGuard)
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
      tags: dto.tags,
      status: dto.status,
    });
    return new SuccessResponseDto(NewsResponseDto.fromDomain(news), 'News updated');
  }

  @Delete(':id')
  @UseGuards(ApprovedGuard, RolesGuard)
  @Roles(UserRole.EDITOR, UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<SuccessResponseDto<null>> {
    await this.deleteNews.execute(id);
    return new SuccessResponseDto(null, 'News deleted');
  }
}
