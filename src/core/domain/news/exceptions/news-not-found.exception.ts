import { BusinessException } from '../../../shared/exceptions/business.exception';

export class NewsNotFoundException extends BusinessException {
  constructor(id?: number) {
    super(id ? `News with id ${id} not found` : 'News not found', 404);
    this.name = 'NewsNotFoundException';
  }
}
