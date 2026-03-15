import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateTagUseCase } from '../../application/tag/use-cases/create-tag.use-case';
import { GetAllTagsUseCase } from '../../application/tag/use-cases/get-all-tags.use-case';
import { GetTagByIdUseCase } from '../../application/tag/use-cases/get-tag-by-id.use-case';
import { GetLastThreeTagsUseCase } from '../../application/tag/use-cases/get-last-three-tags.use-case';
import { TagCreateDto } from '../../application/tag/dtos/tag-create.dto';
import { TagResponseDto } from '../../application/tag/dtos/tag-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly getAllTags: GetAllTagsUseCase,
    private readonly getTagById: GetTagByIdUseCase,
    private readonly getLastThreeTags: GetLastThreeTagsUseCase,
    private readonly createTag: CreateTagUseCase,
  ) {}

  @Get()
  async findAll(): Promise<SuccessResponseDto<TagResponseDto[]>> {
    const tags = await this.getAllTags.execute();
    return new SuccessResponseDto(tags.map(TagResponseDto.fromDomain), 'Tags retrieved');
  }

  // Declare static route BEFORE parameterized :id
  @Get('last-three')
  async findLastThree(): Promise<SuccessResponseDto<TagResponseDto[]>> {
    const tags = await this.getLastThreeTags.execute();
    return new SuccessResponseDto(tags.map(TagResponseDto.fromDomain), 'Last three tags retrieved');
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<TagResponseDto>> {
    const tag = await this.getTagById.execute(id);
    return new SuccessResponseDto(TagResponseDto.fromDomain(tag), 'Tag retrieved');
  }

  @Post()
  @UseGuards(JwtAuthGuard, ApprovedGuard, RolesGuard)
  @Roles(UserRole.EDITOR)
  async create(@Body() dto: TagCreateDto): Promise<SuccessResponseDto<TagResponseDto>> {
    const tag = await this.createTag.execute(dto.name);
    return new SuccessResponseDto(TagResponseDto.fromDomain(tag), 'Tag created');
  }
}
