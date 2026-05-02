import { BusinessException } from '../../../shared/exceptions/business.exception';

export class LikeNotFoundException extends BusinessException {
  constructor() {
    super('Like not found', 404);
    this.name = 'LikeNotFoundException';
  }
}
