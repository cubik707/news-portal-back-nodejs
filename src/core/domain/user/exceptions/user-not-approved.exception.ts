import { BusinessException } from '../../../shared/exceptions/business.exception';

export class UserNotApprovedException extends BusinessException {
  constructor() {
    super('User account is not approved', 401);
    this.name = 'UserNotApprovedException';
  }
}
