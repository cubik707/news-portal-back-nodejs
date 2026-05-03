import { BusinessException } from '../../../shared/exceptions/business.exception';

export class AmendmentAlreadyPendingException extends BusinessException {
  constructor() {
    super('User already has a pending amendment', 409);
    this.name = 'AmendmentAlreadyPendingException';
  }
}
