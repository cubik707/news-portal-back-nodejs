import { Test, TestingModule } from '@nestjs/testing';
import { CreateCategoryUseCase } from './create-category.use-case';
import { UpdateCategoryUseCase } from './update-category.use-case';
import { DeleteCategoryUseCase } from './delete-category.use-case';
import { GetAllCategoriesUseCase } from './get-all-categories.use-case';
import { GetCategoryByIdUseCase } from './get-category-by-id.use-case';
import { CATEGORY_REPOSITORY } from '../../../core/domain/category/repositories/category.repository.interface';
import { Category } from '../../../core/domain/category/entities/category.domain';
import { CategoryNotFoundException } from '../../../core/domain/category/exceptions/category-not-found.exception';

const makeCategory = (id = 'cat-id', name = 'Tech') =>
  Category.reconstitute({ id, name });

// ─── CreateCategoryUseCase ───────────────────────────────────────────────────

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let categoryRepository: { save: jest.Mock };

  beforeEach(async () => {
    categoryRepository = { save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCategoryUseCase,
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    useCase = module.get(CreateCategoryUseCase);
  });

  it('should create and return a new category', async () => {
    const category = makeCategory();
    categoryRepository.save.mockResolvedValue(category);

    const result = await useCase.execute('Tech');

    expect(result).toBe(category);
    expect(categoryRepository.save).toHaveBeenCalledWith(expect.any(Category));
  });
});

// ─── UpdateCategoryUseCase ───────────────────────────────────────────────────

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
  let categoryRepository: { findById: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    categoryRepository = { findById: jest.fn(), update: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCategoryUseCase,
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    useCase = module.get(UpdateCategoryUseCase);
  });

  it('should update and return the category', async () => {
    const category = makeCategory();
    const updated = makeCategory('cat-id', 'Updated');
    categoryRepository.findById.mockResolvedValue(category);
    categoryRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute('cat-id', 'Updated');

    expect(result).toBe(updated);
    expect(categoryRepository.update).toHaveBeenCalledWith('cat-id', category);
  });

  it('should throw CategoryNotFoundException when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-id', 'Name')).rejects.toThrow(CategoryNotFoundException);
    expect(categoryRepository.update).not.toHaveBeenCalled();
  });
});

// ─── DeleteCategoryUseCase ───────────────────────────────────────────────────

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let categoryRepository: { findById: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    categoryRepository = { findById: jest.fn(), delete: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCategoryUseCase,
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    useCase = module.get(DeleteCategoryUseCase);
  });

  it('should delete an existing category', async () => {
    categoryRepository.findById.mockResolvedValue(makeCategory());
    categoryRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('cat-id');

    expect(categoryRepository.delete).toHaveBeenCalledWith('cat-id');
  });

  it('should throw CategoryNotFoundException when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-id')).rejects.toThrow(CategoryNotFoundException);
    expect(categoryRepository.delete).not.toHaveBeenCalled();
  });
});

// ─── GetAllCategoriesUseCase ─────────────────────────────────────────────────

describe('GetAllCategoriesUseCase', () => {
  let useCase: GetAllCategoriesUseCase;
  let categoryRepository: { findAll: jest.Mock };

  beforeEach(async () => {
    categoryRepository = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCategoriesUseCase,
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    useCase = module.get(GetAllCategoriesUseCase);
  });

  it('should return all categories', async () => {
    const categories = [makeCategory('1', 'Tech'), makeCategory('2', 'Sports')];
    categoryRepository.findAll.mockResolvedValue(categories);

    const result = await useCase.execute();

    expect(result).toEqual(categories);
    expect(categoryRepository.findAll).toHaveBeenCalled();
  });
});

// ─── GetCategoryByIdUseCase ──────────────────────────────────────────────────

describe('GetCategoryByIdUseCase', () => {
  let useCase: GetCategoryByIdUseCase;
  let categoryRepository: { findById: jest.Mock };

  beforeEach(async () => {
    categoryRepository = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCategoryByIdUseCase,
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    useCase = module.get(GetCategoryByIdUseCase);
  });

  it('should return a category when found', async () => {
    const category = makeCategory();
    categoryRepository.findById.mockResolvedValue(category);

    const result = await useCase.execute('cat-id');

    expect(result).toBe(category);
    expect(categoryRepository.findById).toHaveBeenCalledWith('cat-id');
  });

  it('should throw CategoryNotFoundException when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad-id')).rejects.toThrow(CategoryNotFoundException);
  });
});
