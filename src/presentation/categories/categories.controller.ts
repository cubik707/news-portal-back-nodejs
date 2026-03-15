import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateCategoryUseCase } from '../../application/category/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/category/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/category/use-cases/delete-category.use-case';
import { GetAllCategoriesUseCase } from '../../application/category/use-cases/get-all-categories.use-case';
import { GetCategoryByIdUseCase } from '../../application/category/use-cases/get-category-by-id.use-case';
import { CategoryCreateDto } from '../../application/category/dtos/category-create.dto';
import { CategoryResponseDto } from '../../application/category/dtos/category-response.dto';
import { SuccessResponseDto } from '../shared/response/success-response.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { ApprovedGuard } from '../shared/guards/approved.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { UserRole } from '../../core/shared/enums/user-role.enum';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly getAllCategories: GetAllCategoriesUseCase,
    private readonly getCategoryById: GetCategoryByIdUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  @Get()
  async findAll(): Promise<SuccessResponseDto<CategoryResponseDto[]>> {
    const categories = await this.getAllCategories.execute();
    return new SuccessResponseDto(
      categories.map(CategoryResponseDto.fromDomain),
      'Categories retrieved',
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<CategoryResponseDto>> {
    const category = await this.getCategoryById.execute(id);
    return new SuccessResponseDto(CategoryResponseDto.fromDomain(category), 'Category retrieved');
  }

  @Post()
  @UseGuards(JwtAuthGuard, ApprovedGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CategoryCreateDto): Promise<SuccessResponseDto<CategoryResponseDto>> {
    const category = await this.createCategory.execute(dto.name);
    return new SuccessResponseDto(CategoryResponseDto.fromDomain(category), 'Category created');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ApprovedGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: CategoryCreateDto,
  ): Promise<SuccessResponseDto<CategoryResponseDto>> {
    const category = await this.updateCategory.execute(id, dto.name);
    return new SuccessResponseDto(CategoryResponseDto.fromDomain(category), 'Category updated');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ApprovedGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string): Promise<SuccessResponseDto<null>> {
    await this.deleteCategory.execute(id);
    return new SuccessResponseDto(null, 'Category deleted');
  }
}
