import { BusinessException } from '../../../shared/exceptions/business.exception';

export class UserNotFoundException extends BusinessException {
  constructor(id?: number | string) {
    super(id ? `User with id ${id} not found` : 'User not found', 404);
    this.name = 'UserNotFoundException';
  }
}
