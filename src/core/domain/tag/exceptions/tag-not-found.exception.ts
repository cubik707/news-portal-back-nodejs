import { BusinessException } from '../../../shared/exceptions/business.exception';

export class TagNotFoundException extends BusinessException {
  constructor(id?: string) {
    super(id ? `Tag with id ${id} not found` : 'Tag not found', 404);
    this.name = 'TagNotFoundException';
  }
}
