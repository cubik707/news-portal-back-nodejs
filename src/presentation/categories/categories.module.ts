import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { CategoriesController } from './categories.controller';
import { CreateCategoryUseCase } from '../../application/category/use-cases/create-category.use-case';
import { UpdateCategoryUseCase } from '../../application/category/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/category/use-cases/delete-category.use-case';
import { GetAllCategoriesUseCase } from '../../application/category/use-cases/get-all-categories.use-case';
import { GetCategoryByIdUseCase } from '../../application/category/use-cases/get-category-by-id.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    GetAllCategoriesUseCase,
    GetCategoryByIdUseCase,
  ],
})
export class CategoriesModule {}
