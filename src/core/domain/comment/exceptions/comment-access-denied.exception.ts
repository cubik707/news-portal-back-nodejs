import { BusinessException } from '../../../shared/exceptions/business.exception';

export class CommentAccessDeniedException extends BusinessException {
  constructor() {
    super('Access to this comment is denied', 403);
    this.name = 'CommentAccessDeniedException';
  }
}
