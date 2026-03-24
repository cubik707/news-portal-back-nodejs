import { BusinessException } from '../../../shared/exceptions/business.exception';

export class CommentNotFoundException extends BusinessException {
  constructor(id?: string) {
    super(id ? `Comment with id ${id} not found` : 'Comment not found', 404);
    this.name = 'CommentNotFoundException';
  }
}
