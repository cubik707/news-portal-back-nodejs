import { BusinessException } from '../../../shared/exceptions/business.exception';

export class CategoryNotFoundException extends BusinessException {
  constructor(id?: number) {
    super(id ? `Category with id ${id} not found` : 'Category not found', 404);
    this.name = 'CategoryNotFoundException';
  }
}
