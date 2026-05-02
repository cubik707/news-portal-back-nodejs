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
import { SubmitNewsForApprovalUseCase } from '../../application/news-approval/use-cases/submit-news-for-approval.use-case';
import { PublishApprovedNewsUseCase } from '../../application/news/use-cases/publish-approved-news.use-case';
import { NewsCreateDto } from '../../application/news/dtos/news-create.dto';
import { NewsUpdateDto } from '../../application/news/dtos/news-update.dto';
import { NewsResponseDto } from '../../application/news/dtos/news-response.dto';
import { NewsApprovalResponseDto } from '../../application/news-approval/dtos/news-approval-response.dto';
import { SubmitNewsApprovalDto } from '../../application/news-approval/dtos/submit-news-approval.dto';
import { NewsStatus } from '../../core/shared/enums/news-status.enum';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';
import type { JwtUserPayload } from '../auth/jwt.strategy';
import { ApprovalsGateway } from '../approvals-gateway/approvals.gateway';

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
    private readonly submitForApproval: SubmitNewsForApprovalUseCase,
    private readonly publishApprovedNews: PublishApprovedNewsUseCase,
    private readonly gateway: ApprovalsGateway,
  ) {}

  @Get()
  async findAll(): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getAllNews.execute();
    return new SuccessResponseDto(
      items.map(({ news, commentCount }) => NewsResponseDto.fromDomain(news, commentCount)),
      'News retrieved',
    );
  }

  // Declare static routes BEFORE parameterized :id to avoid conflicts
  @Get('status')
  async findByStatus(
    @Query('status') status: NewsStatus,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getNewsByStatus.execute(status);
    return new SuccessResponseDto(
      items.map(({ news, commentCount }) => NewsResponseDto.fromDomain(news, commentCount)),
      'News retrieved',
    );
  }

  @Get('category/:categoryId')
  async findByCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getNewsByCategory.execute(categoryId);
    return new SuccessResponseDto(
      items.map(({ news, commentCount }) => NewsResponseDto.fromDomain(news, commentCount)),
      'News retrieved',
    );
  }

  @Get('category/:categoryId/status')
  async findByCategoryAndStatus(
    @Param('categoryId') categoryId: string,
    @Query('status') status: NewsStatus,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getNewsByCategoryAndStatus.execute(categoryId, status);
    return new SuccessResponseDto(
      items.map(({ news, commentCount }) => NewsResponseDto.fromDomain(news, commentCount)),
      'News retrieved',
    );
  }

  @Get('author/:authorId/status')
  async findByStatusAndAuthor(
    @Param('authorId') authorId: string,
    @Query('status') status: NewsStatus,
  ): Promise<SuccessResponseDto<NewsResponseDto[]>> {
    const items = await this.getNewsByStatusAndAuthor.execute(authorId, status);
    return new SuccessResponseDto(
      items.map(({ news, commentCount }) => NewsResponseDto.fromDomain(news, commentCount)),
      'News retrieved',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<NewsResponseDto>> {
    const { news, commentCount } = await this.getNewsById.execute(id);
    return new SuccessResponseDto(NewsResponseDto.fromDomain(news, commentCount), 'News retrieved');
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

  @Post(':id/submit-for-approval')
  @UseGuards(ApprovedGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  async submitNewsForApproval(
    @Param('id') id: string,
    @Body() dto: SubmitNewsApprovalDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsApprovalResponseDto>> {
    const { approval, targetAdminIds } = await this.submitForApproval.execute({
      newsId: id,
      editorId: user.id,
      adminId: dto.adminId,
    });
    this.gateway.emitApprovalNew(targetAdminIds, {
      approvalId: approval.id,
      newsId: approval.newsId,
      newsTitle: '—',
      editorName: user.username,
    });
    return new SuccessResponseDto(
      NewsApprovalResponseDto.fromDomain(approval),
      'Submitted for approval',
    );
  }

  @Post(':id/publish')
  @UseGuards(ApprovedGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<SuccessResponseDto<NewsResponseDto>> {
    const news = await this.publishApprovedNews.execute(id, user.id);
    return new SuccessResponseDto(NewsResponseDto.fromDomain(news), 'News published');
  }
}
