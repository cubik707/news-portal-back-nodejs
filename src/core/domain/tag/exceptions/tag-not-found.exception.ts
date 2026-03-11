import { BusinessException } from '../../../shared/exceptions/business.exception';

export class TagNotFoundException extends BusinessException {
  constructor(id?: number) {
    super(id ? `Tag with id ${id} not found` : 'Tag not found', 404);
    this.name = 'TagNotFoundException';
  }
}
